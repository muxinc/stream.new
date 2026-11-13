import Mux from '@mux/ts';
import type { Asset } from '@mux/ts/resources/video/assets';
import logger from './logger';
import { VIDEOJS_HLSJS_TYPE, VIDEOJS_SPF_TYPE } from '../constants';
import type { StreamType } from './player-page-utils';

export type VideojsEngine = 'spf' | 'hlsjs';

const mux = new Mux();

/*
 * Engine selection for the auto video.js player type.
 *
 * SPF is the default answer. Since video.js #9554 the Mux SPF media plays
 * MPEG-TS on-demand content (H.264 + AAC, transmuxed to fMP4 in the client)
 * as well as CMAF, so every quality tier, clips and audio-only assets go to
 * SPF. hls.js is picked only for what the SPF engine documents it cannot
 * (fully) play — the sources are in the video.js repo:
 *
 * - Live, any latency mode (and assets still recording from a live stream).
 *   Standard- and reduced-latency Mux live is MPEG-TS, and the transmuxer
 *   covers on-demand TS only: "Not covered: ... what live TS needs (a PES
 *   split across segments, PTS rollover, discontinuities)"
 *   (packages/spf/docs/reference/features/mpeg-ts-transmux.md). Low-latency
 *   live is CMAF and does play, but LL-HLS itself is not implemented — it
 *   degrades to standard-live latency
 *   (internal/design/spf/features/ll-hls-support.md) — and growing-window
 *   (EVENT / DVR) playlists have known failures
 *   (internal/design/spf/features/dvr-event-stream-support.md).
 * - Assets recorded from a live stream, any latency mode. Recordings keep
 *   the live packager's segments, so they can carry discontinuities, which
 *   no SPF source handles, and for standard/reduced latency they are
 *   live-packaged MPEG-TS (the "live TS" traits above, on demand).
 * - DRM playback IDs. SPF does implement DRM, but stream.new has no DRM
 *   wiring, so neither engine can play these; hls.js is the unchanged,
 *   do-no-extra-harm answer.
 *
 * - Anything whose media playlist has an #EXT-X-DISCONTINUITY, whatever the
 *   API says about it (covers other environments' recordings, and clips cut
 *   from them).
 *
 * Unknowns: when the Mux API can't describe the playback ID (another
 * environment's public ID, or an API error), on-demand content without
 * discontinuities still goes to SPF — the common cases all play there, and
 * an unsupported source fails loudly (reported to Sentry, see components/videojs-media.tsx). The explicit
 * player types (videojs-hlsjs, videojs-spf, mux-player) remain as overrides.
 */

/*
 * The synchronous core: predict the engine from an asset object already in
 * hand (e.g. /api/assets/[id]). No further API calls are needed.
 */
export function getVideojsEngineForAsset(asset: Asset): VideojsEngine {
  if (asset.playback_ids?.some((p) => p.policy === 'drm')) return 'hlsjs';

  // Still recording (a growing EVENT window), or recorded from a live stream.
  if (asset.is_live || asset.live_stream_id) return 'hlsjs';

  // Everything else on demand: basic/plus/premium, clips, audio-only.
  return 'spf';
}

type PlaylistFacts = { streamType?: StreamType; hasDiscontinuity?: boolean };

/*
 * Full lookup for callers that only have a playback ID (the /v pages).
 *
 * `streamType` and `hasDiscontinuity` are the playlist-derived facts the page
 * already has (lib/player-page-utils.ts); they work for every public playback
 * ID, including ones the API can't see, and decide without the API.
 *
 * NOTE: only playback IDs in this environment (MUX_TOKEN_ID/SECRET) are
 * visible to the API; anything else 400s and is treated as plain on-demand
 * content (SPF).
 */
export async function getVideojsEngineForPlaybackId(
  playbackId: string,
  { streamType, hasDiscontinuity }: PlaylistFacts = {}
): Promise<VideojsEngine> {
  if (streamType === 'live' || hasDiscontinuity) return 'hlsjs';

  try {
    const { policy, object } = await mux.video.playbackIds.retrieve(playbackId);
    if (policy === 'drm') return 'hlsjs';

    // A live stream's playback ID that didn't classify as live above (idle
    // stream, or no streamType passed).
    if (object.type === 'live_stream') return 'hlsjs';

    const asset = await mux.video.assets.retrieve(object.id);
    return getVideojsEngineForAsset(asset);
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
  options: PlaylistFacts = {}
): Promise<VideojsEngine> {
  if (playerType === VIDEOJS_SPF_TYPE) return 'spf';
  if (playerType === VIDEOJS_HLSJS_TYPE) return 'hlsjs';
  return getVideojsEngineForPlaybackId(playbackId, options);
}
