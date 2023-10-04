export const MUX_HOME_PAGE_URL = 'https://mux.com?utm_source=stream-new';
export const MUX_TERMS_URL = 'https://mux.com/terms?utm_source=stream-new';
export const OPEN_SOURCE_URL = 'https://github.com/muxinc/stream.new';
export const HOST_URL = 'https://stream.new';
export const PLYR_TYPE = 'plyr';
export const MUX_PLAYER_TYPE = 'mux-player';
export const MUX_PLAYER_CLASSIC_TYPE = 'classic';
export const MUX_VIDEO_TYPE = 'mux-video';
export const WINAMP_PLAYER_TYPE = 'winamp';
export const VALID_PLAYER_TYPES = [
  PLYR_TYPE,
  MUX_PLAYER_TYPE,
  MUX_PLAYER_CLASSIC_TYPE,
  MUX_VIDEO_TYPE,
  WINAMP_PLAYER_TYPE,
];
export type PlayerTypes =
  | typeof PLYR_TYPE
  | typeof MUX_PLAYER_TYPE
  | typeof MUX_PLAYER_CLASSIC_TYPE
  | typeof MUX_VIDEO_TYPE
  | typeof WINAMP_PLAYER_TYPE;
export const MUX_DATA_CUSTOM_DOMAIN = 'data.stream.new';
