import { getImageDimensions } from './image-dimensions';
import { getImageBaseUrl } from './urlutils';
import { HOST_URL } from '../constants';

export type Props = {
  playbackId: string;
  shareUrl: string;
  poster: string;
  aspectRatio?: number;
  videoExists: boolean;
  playerType?: | 'plyr' | 'mux-player';
};

export async function getPropsFromPlaybackId (playbackId: string):Promise<Props> {
  const poster = `${getImageBaseUrl()}/${playbackId}/thumbnail.jpg`;
  const shareUrl = `${HOST_URL}/v/${playbackId}`;
  const dimensions = await getImageDimensions(playbackId);
  const props = { playbackId, shareUrl, poster };

  if (dimensions) {
    return { ...props, aspectRatio: dimensions.aspectRatio, videoExists: true };
  } else {
    return { ...props, videoExists: false };
  }
}
