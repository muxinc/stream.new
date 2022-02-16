import { getImageDimensions } from './image-dimensions';
import { getImageBaseUrl } from './urlutils';
import { HOST_URL } from '../constants';

export type Props = {
  playbackId: string;
  shareUrl: string;
  poster: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  videoExists: boolean;
};

export async function getPropsFromPlaybackId (playbackId: string):Promise<Props> {
  const poster = `${getImageBaseUrl()}/${playbackId}/thumbnail.jpg`;
  const shareUrl = `${HOST_URL}/v/${playbackId}`;
  const dimensions = await getImageDimensions(playbackId);
  const props = { playbackId, shareUrl, poster };

  if (dimensions) {
    return { ...props, ...dimensions, videoExists: true };
  } else {
    return { ...props, videoExists: false };
  }
}
