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

const MUX_API = 'https://api.mux.com';

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

  test('picks hls.js for an asset recorded from a live stream', () => {
    expect(getVideojsEngineForAsset(makeAsset({ live_stream_id: 'stream-1' }))).toBe('hlsjs');
  });
});

describe('getVideojsEngineForPlaybackId', () => {
  test('picks hls.js for live content without calling the API', async () => {
    await expect(getVideojsEngineForPlaybackId('playback-1', { streamType: 'live' })).resolves.toBe('hlsjs');
  });

  test('picks hls.js for content with discontinuities without calling the API', async () => {
    await expect(
      getVideojsEngineForPlaybackId('playback-1', { streamType: 'on-demand', hasDiscontinuity: true })
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
    await expect(getVideojsEngineForPlaybackId('playback-1', { streamType: 'on-demand' })).resolves.toBe('hlsjs');
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
