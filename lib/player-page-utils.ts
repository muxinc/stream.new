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
const getStreamTypeFromPlaylists = async (multivariant: string): Promise<StreamType> => {
  const mediaPlaylistUrl = multivariant.match(/^https?:\/\/\S+$/m)?.[0];
  if (!mediaPlaylistUrl) return 'on-demand';
  const resp = await fetch(mediaPlaylistUrl);
  if (!resp.ok) return 'on-demand';
  return /^#EXT-X-ENDLIST\s*$/m.test(await resp.text()) ? 'on-demand' : 'live';
};

const getStreamInfoAsync = async (
  playbackId: string
): Promise<{ videoExists: boolean; streamType: StreamType }> => {
  // NOTE: Would prefer to use a HEAD method request, but these appear to be not allowed (status 405) from Mux Video (CJP)
  const resp = await fetch(`${getStreamBaseUrl()}/${playbackId}.m3u8`);
  const videoExists = resp.status >= 200 && resp.status <= 399;
  if (!videoExists) return { videoExists, streamType: 'on-demand' };
  const streamType = await getStreamTypeFromPlaylists(await resp.text());
  return { videoExists, streamType };
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
  const { videoExists, streamType } = await getStreamInfoAsync(playbackId);
  const props: Props = {
    blurDataURL,
    playbackId,
    shareUrl,
    poster,
    videoExists,
    streamType,
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
