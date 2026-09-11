export const MUX_HOME_PAGE_URL = 'https://mux.com?utm_source=stream-new';
export const MUX_TERMS_URL = 'https://mux.com/terms?utm_source=stream-new';
export const OPEN_SOURCE_URL = 'https://github.com/muxinc/stream.new';
export const HOST_URL = 'https://stream.new';
export const PLYR_TYPE = 'plyr';
export const MUX_VIDEO_TYPE = 'mux-video';
export const MUX_PLAYER_TYPE = 'mux-player';
export const MUX_PLAYER_CLASSIC_TYPE = 'classic';
export const WINAMP_PLAYER_TYPE = 'winamp';
export const VIDEOJS_V10_SPF_TYPE = 'videojs-v10-spf';
export const VIDEOJS_V10_HLSJS_TYPE = 'videojs-v10-hlsjs';
// Auto: the engine (SPF vs hls.js) is selected server-side per playback ID
// (see lib/videojs-v10-engine.ts); the explicit types above stay as overrides.
export const VIDEOJS_V10_TYPE = 'videojs-v10';
export const VALID_PLAYER_TYPES = [
  PLYR_TYPE,
  MUX_VIDEO_TYPE,
  MUX_PLAYER_TYPE,
  MUX_PLAYER_CLASSIC_TYPE,
  WINAMP_PLAYER_TYPE,
  VIDEOJS_V10_SPF_TYPE,
  VIDEOJS_V10_HLSJS_TYPE,
];
/*
 * Player types whose /v pages are fully server-rendered (see
 * components/videojs-v10-player-page.tsx) rather than rendered client-side via
 * PlayerPage/PlayerLoader.
 */
export const VIDEOJS_V10_PLAYER_TYPES: string[] = [
  VIDEOJS_V10_TYPE,
  VIDEOJS_V10_SPF_TYPE,
  VIDEOJS_V10_HLSJS_TYPE,
];
/*
 * The player /v/[id] renders. video.js v10 (hls.js-backed) as of 2026-09-11;
 * Mux Player remains available at /v/[id]/mux-player. The SPF-backed and
 * auto-selected v10 types stay opt-in until the fast-follow items in
 * VIDEOJS_V10_INTEGRATION_NOTES.md ("Default player switch") land. (CJP)
 */
export const DEFAULT_PLAYER_TYPE = VIDEOJS_V10_HLSJS_TYPE;
export type PlayerTypes =
  | typeof PLYR_TYPE
  | typeof MUX_VIDEO_TYPE
  | typeof MUX_PLAYER_TYPE
  | typeof MUX_PLAYER_CLASSIC_TYPE
  | typeof WINAMP_PLAYER_TYPE
  | typeof VIDEOJS_V10_SPF_TYPE
  | typeof VIDEOJS_V10_HLSJS_TYPE;
export const MUX_DATA_CUSTOM_DOMAIN = 'data.stream.new';
/*
 * Used when the thumbnail probe yields no dimensions (network hiccup, brand-new
 * asset): keeps a reserved box for the server-rendered player and the
 * twitter:player card instead of emitting `aspect-ratio: undefined`. Matches
 * the /embed page's assumption. (CJP)
 */
export const DEFAULT_PLAYER_ASPECT_RATIO = 16 / 9;
