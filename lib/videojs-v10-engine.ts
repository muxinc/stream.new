import Mux from '@mux/mux-node';
import type { Asset } from '@mux/mux-node/resources/video/assets';
import logger from './logger';
import { VIDEOJS_V10_HLSJS_TYPE, VIDEOJS_V10_SPF_TYPE } from '../constants';

export type VideojsV10Engine = 'spf' | 'hlsjs';

const mux = new Mux();

/*
 * Engine selection for the auto video.js v10 player type.
 *
 * SPF cannot play MPEG-TS segments, so pick it only when the content is
 * confidently CMAF/fMP4. hls.js plays both containers, so it is the safe
 * answer for every ambiguity: plus/smart-quality assets (TS unless an
 * environment-level flag we cannot see), clips, audio-only, standard- and
 * reduced-latency live, playback IDs from other environments (no API
 * visibility), legacy assets that predate the quality tiers, deleted parent
 * live streams, and API errors. Confident CMAF means: basic- or
 * premium-quality on-demand video (those tiers postdate the CMAF rollout, so
 * no date check is needed), or content from a low-latency live stream
 * (always CMAF, including its recorded assets). The rules and their
 * provenance are recorded in the v10 integration notes (kept outside this repo; "Engine
 * selection research"). (CJP)
 */

type LatencyMode = 'low' | 'reduced' | 'standard';

/*
 * The synchronous core: predict the engine from an asset object already in
 * hand. For assets recorded from a live stream the container follows the
 * stream, and the asset carries no latency echo — pass the parent stream's
 * latency_mode when known; when it isn't, the answer is hls.js.
 */
export function getV10EngineFromAsset(
  asset: Asset,
  { liveStreamLatencyMode }: { liveStreamLatencyMode?: LatencyMode } = {}
): VideojsV10Engine {
  // stream.new has no DRM wiring, and DRM'd media won't play on either
  // engine without it; hls.js is simply the do-no-extra-harm default.
  if (asset.playback_ids?.some((p) => p.policy === 'drm')) return 'hlsjs';

  // Recorded-from-live assets keep their stream's container ("assets created
  // from a lowlatency stream continue to use CMAF to avoid retranscoding").
  if (asset.live_stream_id) {
    return liveStreamLatencyMode === 'low' ? 'spf' : 'hlsjs';
  }

  // Clips and audio-only/video-only assets are (or can be) forced to TS
  // regardless of quality tier.
  if (asset.ingest_type === 'on_demand_clip' || asset.source_asset_id) {
    return 'hlsjs';
  }
  const tracks = asset.tracks ?? [];
  const hasVideo = tracks.some((t) => t.type === 'video');
  const hasAudio = tracks.some((t) => t.type === 'audio');
  if (!hasVideo || !hasAudio) return 'hlsjs';

  // video_quality is not a required field; the deprecated encoding_tier is.
  const quality =
    asset.video_quality ??
    ({ baseline: 'basic', smart: 'plus', premium: 'premium' } as const)[
      asset.encoding_tier
    ];
  return quality === 'basic' || quality === 'premium' ? 'spf' : 'hlsjs';
}

/*
 * Async wrapper over the sync core for callers that already retrieved the
 * asset (e.g. /api/assets/[id]): performs the parent-live-stream join only
 * when the asset needs it.
 */
export async function getV10EngineForAsset(
  asset: Asset
): Promise<VideojsV10Engine> {
  if (!asset.live_stream_id) return getV10EngineFromAsset(asset);
  try {
    const stream = await mux.video.liveStreams.retrieve(asset.live_stream_id);
    return getV10EngineFromAsset(asset, {
      liveStreamLatencyMode: stream.latency_mode,
    });
  } catch (e) {
    logger.warn('videojs-v10 engine selection fell back to hls.js:', e);
    return 'hlsjs';
  }
}

/*
 * Full lookup for callers that only have a playback ID (the /v pages).
 * NOTE: only playback IDs in this environment (MUX_TOKEN_ID/SECRET) are
 * visible; anything else 400s and lands on the hls.js fallback.
 */
export async function getV10EngineForPlaybackId(
  playbackId: string
): Promise<VideojsV10Engine> {
  try {
    const { policy, object } = await mux.video.playbackIds.retrieve(playbackId);
    if (policy === 'drm') return 'hlsjs';

    if (object.type === 'live_stream') {
      const stream = await mux.video.liveStreams.retrieve(object.id);
      return stream.latency_mode === 'low' ? 'spf' : 'hlsjs';
    }

    const asset = await mux.video.assets.retrieve(object.id);
    return await getV10EngineForAsset(asset);
  } catch (e) {
    logger.warn('videojs-v10 engine selection fell back to hls.js:', e);
    return 'hlsjs';
  }
}

/*
 * Engine for a v10 player type: the explicit types force their engine; the
 * auto type (videojs-v10) resolves it from the playback ID's metadata. Shared
 * by /v/[id] and /v/[id]/[playerType] so the two stay symmetric.
 */
export async function getV10EngineForPlayerType(
  playerType: string,
  playbackId: string
): Promise<VideojsV10Engine> {
  if (playerType === VIDEOJS_V10_SPF_TYPE) return 'spf';
  if (playerType === VIDEOJS_V10_HLSJS_TYPE) return 'hlsjs';
  return getV10EngineForPlaybackId(playbackId);
}
