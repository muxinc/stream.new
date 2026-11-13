import Mux from '@mux/ts';
import type { Asset } from '@mux/ts/resources/video/assets';
import logger from './logger';
import { VIDEOJS_HLSJS_TYPE, VIDEOJS_SPF_TYPE } from '../constants';
import type { PlaylistFacts, StreamType } from './playlist-facts';

export type VideojsEngine = 'spf' | 'hlsjs';

const mux = new Mux();

/*
 * Engine selection for the auto video.js player type.
 *
 * SPF wherever there is evidence it plays the content; hls.js where SPF is
 * documented not to, or where that evidence is missing. "Verified" below
 * means played through this app in headless Chromium (start, sustained
 * playback, seek, end) against the video.js build pinned in package.json;
 * "documented" cites the video.js repo. The evidence and the playback IDs
 * used are recorded on the pull request that introduced this
 * (muxinc/stream.new#245).
 *
 * SPF:
 * - On-demand CMAF, any tier, with or without separate audio renditions,
 *   video-only and audio-only. Verified; SPF's native format.
 * - On-demand MPEG-TS with H.264 + AAC-LC: plus quality and older `smart`
 *   assets (2022 onwards), muxed or with separate audio renditions, and
 *   audio-only. Verified. This is the transmuxer's documented scope
 *   (packages/spf/src/playback/features/mpeg-ts-transmux.ts).
 * - Finished recordings of low-latency live streams (CMAF, live-packaged,
 *   no discontinuities). Verified on a reconstruction — a real Mux LL
 *   stream's segments served as a finished playlist — not on a real
 *   recording asset.
 * - On-demand content the API can't describe (another environment's public
 *   playback ID, or an API error), when the playlist checks below pass.
 *
 * hls.js:
 * - Live, any latency mode, and assets still recording. Standard/reduced
 *   latency is MPEG-TS and "what live TS needs (a PES split across segments,
 *   PTS rollover, discontinuities)" is documented as not covered. Growing
 *   (EVENT / DVR) playlists have documented failures
 *   (internal/design/spf/features/dvr-event-stream-support.md). Low-latency
 *   live did play on SPF for five minutes in testing, but at standard-live
 *   latency (LL-HLS is not implemented:
 *   internal/design/spf/features/ll-hls-support.md), and what happens at
 *   stream end or across an encoder reconnect is untested — unverified, so
 *   kept here.
 * - Any playlist with #EXT-X-DISCONTINUITY. Documented as not covered.
 * - MPEG-TS that is live-packaged: recordings of standard/reduced-latency
 *   streams. Same "live TS" traits, on demand. Documented; no example was
 *   available to test.
 * - MPEG-TS whose variants declare anything but H.264 and AAC-LC (or no
 *   CODECS at all). Documented: the transmuxer covers no other codecs. Mux
 *   has not been seen to deliver this.
 * - MPEG-TS whose last segment is shorter than 0.5s. Verified failure: one
 *   such plus asset (0.078s) never reached `ended` on SPF and did on hls.js;
 *   see SHORT_FINAL_SEGMENT_SECONDS in lib/playlist-facts.ts. An SPF bug to
 *   fix upstream, after which this rule can go.
 * - DRM playback IDs. SPF implements DRM, but stream.new has no DRM wiring,
 *   so neither engine plays these; unchanged.
 *
 * The explicit player types (videojs-hlsjs, videojs-spf, mux-player) remain
 * as overrides. Browsers without Media Source Extensions fall back to hls.js
 * in the client (lib/videojs-client-engine.ts).
 */

type EngineFacts = { streamType?: StreamType; playlist?: PlaylistFacts };

/*
 * What the playlists alone rule out for SPF. Works for every public playback
 * ID, including ones the API can't see. Without playlist facts (the playlist
 * wasn't read) nothing is ruled out here.
 */
function isPlaylistUnsupportedBySpf({ streamType, playlist }: EngineFacts): boolean {
  if (streamType === 'live') return true;
  if (!playlist) return false;
  if (playlist.hasDiscontinuity) return true;

  // The transmuxer's scope (on-demand packaging, H.264 + AAC-LC), and the
  // one MPEG-TS shape seen to fail in testing.
  return (
    playlist.isMpegTs &&
    (playlist.isLivePackaged || !playlist.hasOnlyAvcAndAacLc || playlist.hasShortFinalSegment)
  );
}

/*
 * The synchronous core: predict the engine from an asset object already in
 * hand, plus the playlist facts when the caller has them.
 *
 * Without them (/api/assets/[id], where nothing renders from the value) a
 * recorded-from-live asset can't be told apart by container, so it stays on
 * hls.js.
 */
export function getVideojsEngineForAsset(
  asset: Asset,
  facts: EngineFacts = {}
): VideojsEngine {
  if (isPlaylistUnsupportedBySpf(facts)) return 'hlsjs';
  if (asset.playback_ids?.some((p) => p.policy === 'drm')) return 'hlsjs';

  // Still recording: a growing (EVENT) window.
  if (asset.is_live) return 'hlsjs';

  // Recorded from live: SPF only when the playlist shows CMAF (a low-latency
  // stream's recording). MPEG-TS, or unknown, stays on hls.js.
  if (asset.live_stream_id && (!facts.playlist || facts.playlist.isMpegTs)) {
    return 'hlsjs';
  }

  return 'spf';
}

/*
 * Full lookup for callers that only have a playback ID (the /v pages).
 *
 * NOTE: only playback IDs in this environment (MUX_TOKEN_ID/SECRET) are
 * visible to the API; anything else 400s, and is decided by the playlist
 * facts alone.
 */
export async function getVideojsEngineForPlaybackId(
  playbackId: string,
  facts: EngineFacts = {}
): Promise<VideojsEngine> {
  if (isPlaylistUnsupportedBySpf(facts)) return 'hlsjs';

  try {
    const { policy, object } = await mux.video.playbackIds.retrieve(playbackId);
    if (policy === 'drm') return 'hlsjs';

    // A live stream's playback ID that didn't classify as live above (no
    // stream type passed).
    if (object.type === 'live_stream') return 'hlsjs';

    const asset = await mux.video.assets.retrieve(object.id);
    return getVideojsEngineForAsset(asset, facts);
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
  options: EngineFacts = {}
): Promise<VideojsEngine> {
  if (playerType === VIDEOJS_SPF_TYPE) return 'spf';
  if (playerType === VIDEOJS_HLSJS_TYPE) return 'hlsjs';
  return getVideojsEngineForPlaybackId(playbackId, options);
}
