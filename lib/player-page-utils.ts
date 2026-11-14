import { getImageDimensions } from './image-dimensions';
import { createBlurUp } from '@mux/blurup';
import { getImageBaseUrl, getStreamBaseUrl } from './urlutils';
import type { Metadata } from 'next';
import { HOST_URL, DEFAULT_PLAYER_ASPECT_RATIO } from '../constants';
import type { PlayerTypes } from '../constants';
import logger from './logger';

export type StreamType = 'live' | 'on-demand';

export type Props = {
  blurDataURL?: string;
  playbackId: string;
  shareUrl: string;
  poster: string;
  aspectRatio?: number;
  videoExists: boolean;
  // Decided server-side from the HLS playlists (see getStreamInfoAsync) so the
  // server-rendered video.js page can pick the live skin before any client code
  // runs. Optional only because the client-rendered PlayerPage path doesn't
  // use it; getPropsFromPlaybackId always sets it.
  streamType?: StreamType;
  // See endsWithShortTsSegment; an input to lib/videojs-engine.ts.
  endsWithShortTsSegment?: boolean;
  playerType?: PlayerTypes;
};

/*
 * Mirrors PlayerPage's client-side ?color= parsing (hex digits only, '#'
 * prepended) for the server-rendered player pages. (CJP)
 */
export function getColorFromQueryValue(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  if (/^[0-9a-fA-F]+$/.test(value)) {
    return `#${value}`;
  }
  logger.warn('Invalid color hex value param:', value);
  return undefined;
}

type SearchParams = { [key: string]: string | string[] | undefined };

/*
 * Mirrors PlayerPage's ?time= parsing (parseFloat, falsy → no seek) for the
 * server-rendered player pages. (CJP)
 */
export function getStartTimeFromQueryValue(
  value: string | string[] | undefined
): number | undefined {
  if (typeof value !== 'string') return undefined;
  const t = parseFloat(value);
  return Number.isFinite(t) && t > 0 ? t : undefined;
}

/*
 * Query params the server-rendered video.js pages honor: ?time= and ?color= (the
 * documented ones, see README) plus the testing affordances (?autoplay,
 * ?preload= — see the integration notes' A/B methodology section).
 * Shared by /v/[id] and /v/[id]/[playerType]. (CJP)
 */
export function getVideojsPagePropsFromSearchParams(sp: SearchParams) {
  return {
    startTime: getStartTimeFromQueryValue(sp.time),
    color: getColorFromQueryValue(sp.color),
    autoplay: sp.autoplay !== undefined,
    preload:
      sp.preload === 'none' || sp.preload === 'metadata' || sp.preload === 'auto'
        ? (sp.preload as 'none' | 'metadata' | 'auto')
        : undefined,
  };
}

/*
 * Live vs on-demand from the first media playlist — the same signal Mux
 * Player's engine uses (an HLS playlist without `#EXT-X-ENDLIST` is live).
 *
 * We can't use the Mux API for this: /v/:id plays any public playback ID, and
 * the API only sees playback IDs that belong to stream.new's own Mux
 * environment (anything else answers "mismatching environment"). The playlist
 * is available for every playable ID. Only a playlist we actually read can
 * classify as live; anything else is on-demand. (CJP)
 */
type PlaylistInfo = { streamType: StreamType; endsWithShortTsSegment: boolean };

const UNREAD_PLAYLIST: PlaylistInfo = { streamType: 'on-demand', endsWithShortTsSegment: false };

/*
 * TODO: remove once fixed in video.js SPF. A Mux MPEG-TS (plus quality)
 * asset whose last segment is very short never reaches `ended` on SPF: it
 * stalls just before the end. Reproduced on playback ID
 * g4HJ5zGUrtjtPOUZjXz5tJ2E3bBxQ1f6n01UQATLdBNc (last segment 0.078s); an
 * asset ending in a 0.558s segment is fine. MPEG-TS playlists are the ones
 * without an #EXT-X-MAP init segment.
 */
export const endsWithShortTsSegment = (mediaPlaylist: string): boolean => {
  if (/^#EXT-X-MAP:/m.test(mediaPlaylist)) return false;
  const last = mediaPlaylist.match(/^#EXTINF:[\d.]+/gm)?.pop();
  return last !== undefined && parseFloat(last.slice('#EXTINF:'.length)) < 0.5;
};

const getPlaylistInfo = async (multivariant: string): Promise<PlaylistInfo> => {
  const mediaPlaylistUrl = multivariant.match(/^https?:\/\/\S+$/m)?.[0];
  if (!mediaPlaylistUrl) return UNREAD_PLAYLIST;
  const resp = await fetch(mediaPlaylistUrl);
  if (!resp.ok) return UNREAD_PLAYLIST;
  const mediaPlaylist = await resp.text();
  return {
    streamType: /^#EXT-X-ENDLIST\s*$/m.test(mediaPlaylist) ? 'on-demand' : 'live',
    endsWithShortTsSegment: endsWithShortTsSegment(mediaPlaylist),
  };
};

const getStreamInfoAsync = async (
  playbackId: string
): Promise<{ videoExists: boolean } & PlaylistInfo> => {
  // NOTE: Would prefer to use a HEAD method request, but these appear to be not allowed (status 405) from Mux Video (CJP)
  const resp = await fetch(`${getStreamBaseUrl()}/${playbackId}.m3u8`);
  const videoExists = resp.status >= 200 && resp.status <= 399;
  if (!videoExists) return { videoExists, ...UNREAD_PLAYLIST };
  return { videoExists, ...(await getPlaylistInfo(await resp.text())) };
};

export async function getPropsFromPlaybackId(
  playbackId: string
): Promise<Props> {
  const poster = `${getImageBaseUrl()}/${playbackId}/thumbnail.jpg`;
  const shareUrl = `${HOST_URL}/v/${playbackId}`;
  const dimensions = await getImageDimensions(playbackId);
  let blurDataURL;
  try {
    blurDataURL = (await createBlurUp(playbackId, {})).blurDataURL;
  } catch (e) {
    console.error('Error fetching blurup', e);
  }
  const { videoExists, streamType, endsWithShortTsSegment } = await getStreamInfoAsync(playbackId);
  const props: Props = {
    blurDataURL,
    playbackId,
    shareUrl,
    poster,
    videoExists,
    streamType,
    endsWithShortTsSegment,
  };
  if (dimensions?.aspectRatio) {
    props.aspectRatio = dimensions.aspectRatio;
  }
  return props;
}

/*
 * Social/sharing metadata for the /v pages (both /v/[id] and
 * /v/[id]/[playerType]): Open Graph image, Twitter *player* card pointing at
 * the /embed route, and the oembed discovery link for /api/oembed.
 *
 * This is the App Router home for what PlayerPage/Layout emit via `next/head`
 * — which is a no-op under app/, so those tags never reached the SSR'd head on
 * any player path. (Flagged on the default-player PR; pre-existing since the
 * App Router migration.) (CJP)
 */
export async function getPlayerPageMetadata(playbackId: string): Promise<Metadata> {
  const props = await getPropsFromPlaybackId(playbackId);
  const pageUrl = `${HOST_URL}/v/${playbackId}`;
  const width = 480;
  const height = Math.round(width / (props.aspectRatio ?? DEFAULT_PLAYER_ASPECT_RATIO));
  return {
    title: 'View this video created on stream.new',
    openGraph: {
      images: [props.poster],
    },
    twitter: {
      card: 'player',
      site: '@muxhq',
      images: [props.poster],
      players: [
        {
          playerUrl: `${pageUrl}/embed`,
          streamUrl: `${getStreamBaseUrl()}/${playbackId}.m3u8`,
          width,
          height,
        },
      ],
    },
    alternates: {
      types: {
        'application/json+oembed': `${HOST_URL}/api/oembed?url=${encodeURIComponent(pageUrl)}`,
      },
    },
  };
}
