import { getImageDimensions } from "./image-dimensions";
import muxBlurHash from "@mux/blurhash";
import { getImageBaseUrl, getStreamBaseUrl } from "./urlutils";
import { HOST_URL } from "../constants";
import type { PlayerTypes } from "../constants";

export type Props = {
  blurHashBase64?: string;
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
  let blurHashBase64;
  try {
    blurHashBase64 = (await muxBlurHash(playbackId)).blurHashBase64;
  } catch (e) {
    console.error('Error fetching blurhash', e);
  }
  const videoExists = await getVideoExistsAsync(playbackId);
  const props: Props = {
    blurHashBase64,
    playbackId,
    shareUrl,
    poster,
    videoExists
  };
  if (dimensions?.aspectRatio) {
    props.aspectRatio = dimensions.aspectRatio;
  }
  return props;
}
