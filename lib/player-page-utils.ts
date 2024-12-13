import { getImageDimensions } from './image-dimensions';
// @ts-expect-error no types yet
import { createBlurUp } from '@mux/blurup';
import { getImageBaseUrl, getStreamBaseUrl } from './urlutils';
import { HOST_URL } from '../constants';
import type { PlayerTypes } from '../constants';

export type Props = {
  blurDataURL?: string;
  playbackId: string;
  shareUrl: string;
  poster: string;
  aspectRatio?: number;
  videoExists: boolean;
  playerType?: PlayerTypes;
};

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
