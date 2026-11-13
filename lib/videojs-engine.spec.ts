/**
 * @jest-environment node
 */
import nock from 'nock';
import type { Asset } from '@mux/ts/resources/video/assets';
import {
  getVideojsEngineForAsset,
  getVideojsEngineForPlaybackId,
  getVideojsEngineForPlayerType,
} from './videojs-engine';

import { getPlaylistFacts, hasOnlyAvcAndAacLc } from './playlist-facts';
import type { PlaylistFacts } from './playlist-facts';

const MUX_API = 'https://api.mux.com';

// What the playlists of an uploaded asset look like.
const CMAF: PlaylistFacts = {
  hasDiscontinuity: false,
  isMpegTs: false,
  isLivePackaged: false,
  isLowLatency: false,
  hasShortFinalSegment: false,
  hasOnlyAvcAndAacLc: true,
};
const TS: PlaylistFacts = { ...CMAF, isMpegTs: true };
const onDemand = (playlist: PlaylistFacts) => ({ streamType: 'on-demand' as const, playlist });

const makeAsset = (overrides: Partial<Asset> = {}): Asset =>
  ({
    id: 'asset-1',
    status: 'ready',
    video_quality: 'basic',
    encoding_tier: 'baseline',
    ingest_type: 'on_demand_direct_upload',
    playback_ids: [{ id: 'playback-1', policy: 'public' }],
    tracks: [
      { id: 't1', type: 'video' },
      { id: 't2', type: 'audio' },
    ],
    ...overrides,
  }) as Asset;

const mockPlaybackId = (object: { id: string; type: 'asset' | 'live_stream' }, policy = 'public') =>
  nock(MUX_API)
    .get('/video/v1/playback-ids/playback-1')
    .reply(200, { data: { id: 'playback-1', policy, object } });

const mockAsset = (asset: Asset) =>
  nock(MUX_API).get(`/video/v1/assets/${asset.id}`).reply(200, { data: asset });

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  nock.cleanAll();
  jest.restoreAllMocks();
});

describe('getVideojsEngineForAsset', () => {
  test.each([
    ['basic quality (CMAF)', {}],
    ['plus quality (MPEG-TS)', { video_quality: 'plus', encoding_tier: 'smart' }],
    ['premium quality', { video_quality: 'premium', encoding_tier: 'premium' }],
    ['legacy asset without video_quality', { video_quality: undefined, encoding_tier: 'smart' }],
    ['clip', { ingest_type: 'on_demand_clip', source_asset_id: 'asset-0', video_quality: 'plus' }],
    ['audio-only', { tracks: [{ id: 't2', type: 'audio' }] }],
    ['video-only', { tracks: [{ id: 't1', type: 'video' }] }],
  ] as [string, Partial<Asset>][])('picks SPF for on-demand content: %s', (_name, overrides) => {
    expect(getVideojsEngineForAsset(makeAsset(overrides))).toBe('spf');
  });

  test('picks hls.js for DRM playback IDs', () => {
    const asset = makeAsset({ playback_ids: [{ id: 'playback-1', policy: 'drm' }] });
    expect(getVideojsEngineForAsset(asset)).toBe('hlsjs');
  });

  test('picks hls.js for an asset that is still recording', () => {
    expect(getVideojsEngineForAsset(makeAsset({ is_live: true }))).toBe('hlsjs');
  });

  test('routes live recordings by container', () => {
    const recording = makeAsset({ live_stream_id: 'stream-1' });
    // CMAF: a low-latency stream's recording.
    expect(getVideojsEngineForAsset(recording, onDemand({ ...CMAF, isLivePackaged: true }))).toBe('spf');
    // MPEG-TS: a standard/reduced-latency stream's recording.
    expect(getVideojsEngineForAsset(recording, onDemand({ ...TS, isLivePackaged: true }))).toBe('hlsjs');
    // Container unknown (no playlist facts).
    expect(getVideojsEngineForAsset(recording)).toBe('hlsjs');
  });

  test.each([
    ['discontinuities', { ...CMAF, hasDiscontinuity: true }],
    ['live-packaged MPEG-TS', { ...TS, isLivePackaged: true }],
    ['MPEG-TS with other codecs', { ...TS, hasOnlyAvcAndAacLc: false }],
    ['MPEG-TS with a very short final segment', { ...TS, hasShortFinalSegment: true }],
  ] as [string, PlaylistFacts][])('picks hls.js for an uploaded asset with %s', (_name, playlist) => {
    expect(getVideojsEngineForAsset(makeAsset(), onDemand(playlist))).toBe('hlsjs');
  });

  test('applies the MPEG-TS rules to MPEG-TS only', () => {
    expect(getVideojsEngineForAsset(makeAsset(), onDemand({ ...CMAF, hasOnlyAvcAndAacLc: false }))).toBe('spf');
    expect(getVideojsEngineForAsset(makeAsset(), onDemand({ ...CMAF, hasShortFinalSegment: true }))).toBe('spf');
  });
});

describe('getVideojsEngineForPlaybackId', () => {
  test('picks hls.js for live content without calling the API', async () => {
    await expect(getVideojsEngineForPlaybackId('playback-1', { streamType: 'live' })).resolves.toBe('hlsjs');
  });

  test('picks hls.js for content with discontinuities without calling the API', async () => {
    await expect(
      getVideojsEngineForPlaybackId('playback-1', onDemand({ ...CMAF, hasDiscontinuity: true }))
    ).resolves.toBe('hlsjs');
  });

  test('picks hls.js for low-latency live', async () => {
    await expect(
      getVideojsEngineForPlaybackId('playback-1', { streamType: 'live', playlist: { ...CMAF, isLivePackaged: true, isLowLatency: true } })
    ).resolves.toBe('hlsjs');
  });

  test('picks SPF for a low-latency stream recording the API describes', async () => {
    const asset = makeAsset({ live_stream_id: 'stream-1' });
    const scopes = [mockPlaybackId({ id: asset.id, type: 'asset' }), mockAsset(asset)];
    await expect(
      getVideojsEngineForPlaybackId('playback-1', onDemand({ ...CMAF, isLivePackaged: true }))
    ).resolves.toBe('spf');
    scopes.forEach((scope) => expect(scope.isDone()).toBe(true));
  });

  test('decides from the playlist when the API cannot describe the content', async () => {
    const unknown = () =>
      nock(MUX_API)
        .get('/video/v1/playback-ids/playback-1')
        .reply(400, { error: { type: 'invalid_parameters', messages: ['mismatching environment'] } });
    unknown();
    await expect(getVideojsEngineForPlaybackId('playback-1', onDemand(TS))).resolves.toBe('spf');
    unknown();
    await expect(
      getVideojsEngineForPlaybackId('playback-1', onDemand({ ...CMAF, isLivePackaged: true }))
    ).resolves.toBe('spf');
    // Ruled out by the playlist, without asking the API.
    await expect(
      getVideojsEngineForPlaybackId('playback-1', onDemand({ ...TS, isLivePackaged: true }))
    ).resolves.toBe('hlsjs');
  });

  test('picks SPF for an on-demand plus-quality (MPEG-TS) asset', async () => {
    const asset = makeAsset({ video_quality: 'plus', encoding_tier: 'smart' });
    const scopes = [mockPlaybackId({ id: asset.id, type: 'asset' }), mockAsset(asset)];
    await expect(getVideojsEngineForPlaybackId('playback-1', { streamType: 'on-demand' })).resolves.toBe('spf');
    // The answer came from the asset, not from the no-metadata fallback.
    scopes.forEach((scope) => expect(scope.isDone()).toBe(true));
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('picks hls.js for a DRM playback ID', async () => {
    mockPlaybackId({ id: 'asset-1', type: 'asset' }, 'drm');
    await expect(getVideojsEngineForPlaybackId('playback-1', { streamType: 'on-demand' })).resolves.toBe('hlsjs');
  });

  test('picks hls.js for a live stream playback ID even without a stream type', async () => {
    mockPlaybackId({ id: 'stream-1', type: 'live_stream' });
    await expect(getVideojsEngineForPlaybackId('playback-1')).resolves.toBe('hlsjs');
  });

  test('picks hls.js for an asset recorded from a live stream', async () => {
    const asset = makeAsset({ live_stream_id: 'stream-1' });
    mockPlaybackId({ id: asset.id, type: 'asset' });
    mockAsset(asset);
    await expect(getVideojsEngineForPlaybackId('playback-1', onDemand(TS))).resolves.toBe('hlsjs');
  });

  test('picks SPF for on-demand content the API cannot describe', async () => {
    // What the API answers for a playback ID from another environment.
    nock(MUX_API)
      .get('/video/v1/playback-ids/playback-1')
      .reply(400, { error: { type: 'invalid_parameters', messages: ['mismatching environment'] } });
    await expect(getVideojsEngineForPlaybackId('playback-1', { streamType: 'on-demand' })).resolves.toBe('spf');
  });
});

describe('getVideojsEngineForPlayerType', () => {
  test('explicit player types force their engine, even for live', async () => {
    await expect(getVideojsEngineForPlayerType('videojs-spf', 'playback-1', { streamType: 'live' })).resolves.toBe('spf');
    await expect(getVideojsEngineForPlayerType('videojs-hlsjs', 'playback-1', { streamType: 'on-demand' })).resolves.toBe('hlsjs');
  });

  test('the auto type resolves the engine from the playback ID', async () => {
    await expect(getVideojsEngineForPlayerType('videojs', 'playback-1', { streamType: 'live' })).resolves.toBe('hlsjs');
  });
});

describe('getPlaylistFacts', () => {
  const MULTIVARIANT = [
    '#EXTM3U',
    '#EXT-X-STREAM-INF:BANDWIDTH=1555400,CODECS="mp4a.40.2,avc1.64002a",RESOLUTION=1512x934',
    'https://example.test/rendition.m3u8',
  ].join('\n');
  const media = (...lines: string[]) => ['#EXTM3U', '#EXT-X-TARGETDURATION:6', ...lines, ''].join('\n');

  test('reads an uploaded MPEG-TS asset', () => {
    const playlist = media('#EXT-X-PLAYLIST-TYPE:VOD', '#EXTINF:5,', 'https://example.test/0.ts', '#EXT-X-ENDLIST');
    expect(getPlaylistFacts(MULTIVARIANT, playlist)).toEqual({ streamType: 'on-demand', playlist: TS });
  });

  test('reads an uploaded CMAF asset', () => {
    const playlist = media('#EXT-X-MAP:URI="https://example.test/init.mp4"', '#EXTINF:5,', 'https://example.test/0.m4s', '#EXT-X-ENDLIST');
    expect(getPlaylistFacts(MULTIVARIANT, playlist)).toEqual({ streamType: 'on-demand', playlist: CMAF });
  });

  test('reads a low-latency live stream', () => {
    const playlist = media(
      '#EXT-X-PART-INF:PART-TARGET=1.002',
      '#EXT-X-MAP:URI="https://example.test/init.mp4"',
      '#EXT-X-PROGRAM-DATE-TIME:2026-11-13T23:37:39.641+00:00',
      '#EXTINF:2,',
      'https://example.test/0.m4s',
      '#EXT-X-PART:DURATION=1.002,URI="https://example.test/1.0.m4s"'
    );
    expect(getPlaylistFacts(MULTIVARIANT, playlist)).toEqual({
      streamType: 'live',
      playlist: { ...CMAF, isLivePackaged: true, isLowLatency: true },
    });
  });

  test('reads discontinuities, but not the discontinuity sequence tag', () => {
    const base = ['#EXT-X-DISCONTINUITY-SEQUENCE:0', '#EXTINF:5,', 'https://example.test/0.ts'];
    expect(getPlaylistFacts(MULTIVARIANT, media(...base, '#EXT-X-ENDLIST')).playlist.hasDiscontinuity).toBe(false);
    expect(
      getPlaylistFacts(MULTIVARIANT, media(...base, '#EXT-X-DISCONTINUITY', '#EXTINF:5,', 'https://example.test/1.ts', '#EXT-X-ENDLIST')).playlist.hasDiscontinuity
    ).toBe(true);
  });
});

describe('getPlaylistFacts: final segment', () => {
  const MULTIVARIANT = '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1,CODECS="mp4a.40.2,avc1.64002a"\nhttps://example.test/r.m3u8\n';
  const endingWith = (duration: string) =>
    ['#EXTM3U', '#EXTINF:4,', 'https://example.test/0.ts', `#EXTINF:${duration},`, 'https://example.test/1.ts', '#EXT-X-ENDLIST', ''].join('\n');

  test.each([
    ['0.07798', true],
    ['0.4', true],
    ['0.5584', false],
    ['4', false],
  ] as [string, boolean][])('a %ss final segment is short: %p', (duration, expected) => {
    expect(getPlaylistFacts(MULTIVARIANT, endingWith(duration)).playlist.hasShortFinalSegment).toBe(expected);
  });
});

describe('hasOnlyAvcAndAacLc', () => {
  const variant = (codecs?: string) =>
    `#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1${codecs === undefined ? '' : `,CODECS="${codecs}"`}\nhttps://example.test/r.m3u8\n`;

  test.each(['mp4a.40.2,avc1.64002a', 'avc1.64001f', 'mp4a.40.2'])('accepts %p', (codecs) => {
    expect(hasOnlyAvcAndAacLc(variant(codecs))).toBe(true);
  });

  test.each(['mp4a.40.2,hvc1.2.4.L123.B0', 'mp4a.40.5,avc1.64001f', 'mp4a.40.34,avc1.64001f', 'ac-3,avc1.64001f'])('rejects %p', (codecs) => {
    expect(hasOnlyAvcAndAacLc(variant(codecs))).toBe(false);
  });

  test('rejects variants without CODECS, and playlists without variants', () => {
    expect(hasOnlyAvcAndAacLc(variant())).toBe(false);
    expect(hasOnlyAvcAndAacLc('#EXTM3U\n')).toBe(false);
  });
});
