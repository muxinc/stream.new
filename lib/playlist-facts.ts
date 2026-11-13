/*
 * What a playback ID's HLS playlists (the multivariant and its first media
 * playlist) say about the content. lib/player-page-utils.ts reads them for
 * every /v page, for any public playback ID; lib/videojs-engine.ts decides
 * from the result.
 */
export type StreamType = 'live' | 'on-demand';

export type PlaylistFacts = {
  // #EXT-X-DISCONTINUITY in the media playlist.
  hasDiscontinuity: boolean;
  // Segments are MPEG-TS: the media playlist has no #EXT-X-MAP (CMAF/fMP4
  // always declares its init segment there).
  isMpegTs: boolean;
  // #EXT-X-PROGRAM-DATE-TIME in the media playlist. Mux writes it for live
  // streams and their recordings, not for uploaded assets.
  isLivePackaged: boolean;
  // #EXT-X-PART / #EXT-X-PART-INF: the stream is delivered as LL-HLS.
  isLowLatency: boolean;
  // The last segment is shorter than SHORT_FINAL_SEGMENT_SECONDS.
  hasShortFinalSegment: boolean;
  // Every variant declares CODECS, and all of them are H.264 (avc1) or
  // AAC-LC (mp4a.40.2).
  hasOnlyAvcAndAacLc: boolean;
};

// `playlist` is absent when the playlists couldn't be read.
export type PlaylistInfo = { streamType: StreamType; playlist?: PlaylistFacts };

export const UNREAD_PLAYLIST: PlaylistInfo = { streamType: 'on-demand' };

/*
 * A plus-quality MPEG-TS asset whose last segment is 0.078s never reached
 * `ended` on SPF: playback stalled 0.1s before the end, where hls.js ended
 * normally. One whose last segment is 0.558s ended fine. The line between
 * them is unknown, so it is drawn at the known-good side.
 */
export const SHORT_FINAL_SEGMENT_SECONDS = 0.5;

function hasShortFinalSegment(mediaPlaylist: string): boolean {
  const durations = mediaPlaylist.match(/^#EXTINF:[\d.]+/gm);
  if (!durations?.length) return false;

  const last = parseFloat(durations[durations.length - 1].slice('#EXTINF:'.length));
  return last < SHORT_FINAL_SEGMENT_SECONDS;
}

export function hasOnlyAvcAndAacLc(multivariant: string): boolean {
  const variants = multivariant.match(/^#EXT-X-STREAM-INF:.*$/gm) ?? [];
  if (!variants.length) return false;

  return variants.every((variant) => {
    const codecs = variant.match(/CODECS="([^"]*)"/)?.[1];
    if (!codecs) return false;
    return codecs.split(',').every((codec) => /^avc1\./.test(codec.trim()) || codec.trim() === 'mp4a.40.2');
  });
}

export function getPlaylistFacts(
  multivariant: string,
  mediaPlaylist: string
): { streamType: StreamType; playlist: PlaylistFacts } {
  return {
    streamType: /^#EXT-X-ENDLIST\s*$/m.test(mediaPlaylist) ? 'on-demand' : 'live',
    playlist: {
      hasDiscontinuity: /^#EXT-X-DISCONTINUITY\s*$/m.test(mediaPlaylist),
      isMpegTs: !/^#EXT-X-MAP:/m.test(mediaPlaylist),
      isLivePackaged: /^#EXT-X-PROGRAM-DATE-TIME:/m.test(mediaPlaylist),
      isLowLatency: /^#EXT-X-PART(-INF)?:/m.test(mediaPlaylist),
      hasShortFinalSegment: hasShortFinalSegment(mediaPlaylist),
      hasOnlyAvcAndAacLc: hasOnlyAvcAndAacLc(multivariant),
    },
  };
}
