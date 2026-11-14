/**
 * @jest-environment node
 */
import nock from 'nock';
import type { Asset } from '@mux/ts/resources/video/assets';
import {
  getVideojsEngineFromAsset,
  getVideojsEngineForAsset,
  getVideojsEngineForPlaybackId,
  getVideojsEngineForPlayerType,
} from './videojs-engine';

const MUX_API = 'https://api.mux.com';

const makeAsset = (overrides: Partial<Asset> = {}): Asset =>
  ({
    id: 'asset-1',
    status: 'ready',
    video_quality: 'basic',
    encoding_tier: 'baseline',
    playback_ids: [{ id: 'playback-1', policy: 'public' }],
    ...overrides,
  }) as Asset;

const mockPlaybackId = (object: { id: string; type: 'asset' | 'live_stream' }, policy = 'public') =>
  nock(MUX_API)
    .get('/video/v1/playback-ids/playback-1')
    .reply(200, { data: { id: 'playback-1', policy, object } });

const mockAsset = (asset: Asset) =>
  nock(MUX_API).get(`/video/v1/assets/${asset.id}`).reply(200, { data: asset });

const mockLiveStream = (latency_mode: string) =>
  nock(MUX_API).get('/video/v1/live-streams/stream-1').reply(200, { data: { id: 'stream-1', latency_mode } });

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  nock.cleanAll();
  jest.restoreAllMocks();
});

describe('getVideojsEngineFromAsset', () => {
  test.each([
    ['basic (CMAF)', {}],
    ['plus (MPEG-TS)', { video_quality: 'plus', encoding_tier: 'smart' }],
    ['premium', { video_quality: 'premium', encoding_tier: 'premium' }],
    ['a clip', { ingest_type: 'on_demand_clip', source_asset_id: 'asset-0', video_quality: 'plus' }],
    ['audio-only', { tracks: [{ id: 't1', type: 'audio' }] }],
  ] as [string, Partial<Asset>][])('picks SPF for an on-demand asset: %s', (_name, overrides) => {
    expect(getVideojsEngineFromAsset(makeAsset(overrides))).toBe('spf');
  });

  test('picks hls.js for DRM playback IDs', () => {
    const asset = makeAsset({ playback_ids: [{ id: 'playback-1', policy: 'drm' }] });
    expect(getVideojsEngineFromAsset(asset)).toBe('hlsjs');
  });

  test('routes live recordings by their stream latency mode', () => {
    const recording = makeAsset({ live_stream_id: 'stream-1' });
    expect(getVideojsEngineFromAsset(recording, { liveStreamLatencyMode: 'low' })).toBe('spf');
    expect(getVideojsEngineFromAsset(recording, { liveStreamLatencyMode: 'standard' })).toBe('hlsjs');
    expect(getVideojsEngineFromAsset(recording)).toBe('hlsjs');
  });
});

describe('getVideojsEngineForAsset', () => {
  test('joins the parent live stream for recordings', async () => {
    const scope = mockLiveStream('low');
    await expect(getVideojsEngineForAsset(makeAsset({ live_stream_id: 'stream-1' }))).resolves.toBe('spf');
    expect(scope.isDone()).toBe(true);
  });

  test('picks hls.js when the parent live stream cannot be retrieved', async () => {
    nock(MUX_API).get('/video/v1/live-streams/stream-1').reply(404, { error: { messages: ['not found'] } });
    await expect(getVideojsEngineForAsset(makeAsset({ live_stream_id: 'stream-1' }))).resolves.toBe('hlsjs');
  });
});

describe('getVideojsEngineForPlaybackId', () => {
  test('picks hls.js for live content without calling the API', async () => {
    await expect(getVideojsEngineForPlaybackId('playback-1', { streamType: 'live' })).resolves.toBe('hlsjs');
  });

  test('picks hls.js for an MPEG-TS asset ending in a short segment', async () => {
    await expect(
      getVideojsEngineForPlaybackId('playback-1', { streamType: 'on-demand', endsWithShortTsSegment: true })
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
    await expect(getVideojsEngineForPlaybackId('playback-1')).resolves.toBe('hlsjs');
  });

  test('picks hls.js for a live stream playback ID', async () => {
    mockPlaybackId({ id: 'stream-1', type: 'live_stream' });
    await expect(getVideojsEngineForPlaybackId('playback-1')).resolves.toBe('hlsjs');
  });

  test('picks hls.js for a recording of a standard-latency stream', async () => {
    const asset = makeAsset({ live_stream_id: 'stream-1' });
    mockPlaybackId({ id: asset.id, type: 'asset' });
    mockAsset(asset);
    mockLiveStream('standard');
    await expect(getVideojsEngineForPlaybackId('playback-1')).resolves.toBe('hlsjs');
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
  test('explicit player types force their engine', async () => {
    await expect(getVideojsEngineForPlayerType('videojs-spf', 'playback-1', { streamType: 'live' })).resolves.toBe('spf');
    await expect(getVideojsEngineForPlayerType('videojs-hlsjs', 'playback-1')).resolves.toBe('hlsjs');
  });

  test('the auto type resolves the engine from the playback ID', async () => {
    await expect(getVideojsEngineForPlayerType('videojs', 'playback-1', { streamType: 'live' })).resolves.toBe('hlsjs');
  });
});
