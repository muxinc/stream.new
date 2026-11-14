import Mux from '@mux/ts';
import type { Asset } from '@mux/ts/resources/video/assets';
import logger from './logger';
import { VIDEOJS_HLSJS_TYPE, VIDEOJS_SPF_TYPE } from '../constants';
import type { StreamType } from './player-page-utils';

export type VideojsEngine = 'spf' | 'hlsjs';

const mux = new Mux();

/*
 * Engine selection for the auto video.js player type, for any Mux Video
 * playback ID — /v/:id plays IDs from every environment, not only
 * stream.new's own uploads.
 *
 * SPF plays on-demand assets of every quality tier: basic and premium are
 * CMAF, plus is MPEG-TS, which SPF transmuxes since video.js #9554. That
 * includes clips and audio-only assets.
 *
 * hls.js gets, from the playlist (works for every playback ID):
 * - Live streams and assets still recording. Standard- and reduced-latency
 *   live is MPEG-TS, which SPF's transmuxer doesn't cover for live, and
 *   low-latency live plays on SPF without the low latency (no LL-HLS).
 * - Recordings with a discontinuity (the stream's encoder reconnected),
 *   which SPF doesn't handle.
 * - MPEG-TS assets ending in a very short segment, a known SPF bug (see
 *   endsWithShortTsSegment in lib/player-page-utils.ts).
 *
 * and, from the Mux API (this environment's playback IDs only):
 * - Assets recorded from a standard- or reduced-latency live stream (the
 *   same live-packaged MPEG-TS). Recordings of low-latency streams are CMAF
 *   and go to SPF.
 *
 * Browsers without Media Source Extensions fall back to hls.js in the
 * client (lib/videojs-client-engine.ts).
 */

type LatencyMode = 'low' | 'reduced' | 'standard';

/*
 * The synchronous core: predict the engine from an asset object already in
 * hand. For assets recorded from a live stream the container follows the
 * stream, and the asset carries no latency echo — pass the parent stream's
 * latency_mode when known; when it isn't, the answer is hls.js.
 */
export function getVideojsEngineFromAsset(
  asset: Asset,
  { liveStreamLatencyMode }: { liveStreamLatencyMode?: LatencyMode } = {}
): VideojsEngine {
  // Recorded-from-live assets keep their stream's container ("assets created
  // from a lowlatency stream continue to use CMAF to avoid retranscoding").
  if (asset.live_stream_id) {
    return liveStreamLatencyMode === 'low' ? 'spf' : 'hlsjs';
  }

  return 'spf';
}

/*
 * Async wrapper over the sync core for callers that already retrieved the
 * asset (e.g. /api/assets/[id]): performs the parent-live-stream join only
 * when the asset needs it.
 */
export async function getVideojsEngineForAsset(
  asset: Asset
): Promise<VideojsEngine> {
  if (!asset.live_stream_id) return getVideojsEngineFromAsset(asset);
  try {
    const stream = await mux.video.liveStreams.retrieve(asset.live_stream_id);
    return getVideojsEngineFromAsset(asset, {
      liveStreamLatencyMode: stream.latency_mode,
    });
  } catch (e) {
    logger.warn('videojs engine selection: unknown parent live stream, using hls.js:', e);
    return 'hlsjs';
  }
}

// What the page already read from the playlists (lib/player-page-utils.ts).
type PlaylistInfo = {
  streamType?: StreamType;
  hasDiscontinuity?: boolean;
  endsWithShortTsSegment?: boolean;
};

/*
 * Full lookup for callers that only have a playback ID (the /v pages).
 * NOTE: only playback IDs in this environment (MUX_TOKEN_ID/SECRET) are
 * visible; anything else 400s and is treated as an on-demand asset (SPF).
 */
export async function getVideojsEngineForPlaybackId(
  playbackId: string,
  { streamType, hasDiscontinuity, endsWithShortTsSegment }: PlaylistInfo = {}
): Promise<VideojsEngine> {
  if (streamType === 'live' || hasDiscontinuity || endsWithShortTsSegment) return 'hlsjs';

  try {
    const { object } = await mux.video.playbackIds.retrieve(playbackId);
    if (object.type === 'live_stream') return 'hlsjs';

    const asset = await mux.video.assets.retrieve(object.id);
    return await getVideojsEngineForAsset(asset);
  } catch (e) {
    logger.warn('videojs engine selection: no API metadata, using SPF:', e);
    return 'spf';
  }
}

/*
 * Engine for a video.js player type: the explicit types force their engine; the
 * auto type (videojs) resolves it from the playback ID's metadata. Shared
 * by /v/[id] and /v/[id]/[playerType] so the two stay symmetric.
 */
export async function getVideojsEngineForPlayerType(
  playerType: string,
  playbackId: string,
  playlistInfo: PlaylistInfo = {}
): Promise<VideojsEngine> {
  if (playerType === VIDEOJS_SPF_TYPE) return 'spf';
  if (playerType === VIDEOJS_HLSJS_TYPE) return 'hlsjs';
  return getVideojsEngineForPlaybackId(playbackId, playlistInfo);
}
