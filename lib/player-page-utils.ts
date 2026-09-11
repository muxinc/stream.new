import { getImageDimensions } from './image-dimensions';
import { createBlurUp } from '@mux/blurup';
import { getImageBaseUrl, getStreamBaseUrl } from './urlutils';
import { HOST_URL } from '../constants';
import type { PlayerTypes } from '../constants';
import logger from './logger';

export type Props = {
  blurDataURL?: string;
  playbackId: string;
  shareUrl: string;
  poster: string;
  aspectRatio?: number;
  videoExists: boolean;
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
 * Query params the server-rendered v10 pages honor: ?time= and ?color= (the
 * documented ones, see README) plus the testing affordances (?autoplay,
 * ?preload=, ?perf — see the integration notes' A/B methodology section).
 * Shared by /v/[id] and /v/[id]/[playerType]. (CJP)
 */
export function getV10PagePropsFromSearchParams(sp: SearchParams) {
  return {
    startTime: getStartTimeFromQueryValue(sp.time),
    color: getColorFromQueryValue(sp.color),
    autoplay: sp.autoplay !== undefined,
    preload:
      sp.preload === 'none' || sp.preload === 'metadata' || sp.preload === 'auto'
        ? (sp.preload as 'none' | 'metadata' | 'auto')
        : undefined,
    perf: sp.perf !== undefined,
  };
}

const getVideoExistsAsync = async (playbackId: string) => {
  // NOTE: Would prefer to use a HEAD method request, but these appear to be not allowed (status 405) from Mux Video (CJP)
  return fetch(`${getStreamBaseUrl()}/${playbackId}.m3u8`).then((resp) => {
    return resp.status >= 200 && resp.status <= 399;
  });
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
  const videoExists = await getVideoExistsAsync(playbackId);
  const props: Props = {
    blurDataURL,
    playbackId,
    shareUrl,
    poster,
    videoExists,
  };
  if (dimensions?.aspectRatio) {
    props.aspectRatio = dimensions.aspectRatio;
  }
  return props;
}
