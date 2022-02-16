import probe from 'probe-image-size';

type Dimensions = {
  height: number;
  width: number;
  aspectRatio: number;
}

export async function getImageDimensions (playbackId: string): Promise<Dimensions | null> {
  const imageUrl = `https://image.mux.com/${playbackId}/thumbnail.jpeg?width=480`;
  let imageSize; 
  try {
    imageSize = await probe(imageUrl);
  } catch (e) {
    return null;
  }
  const { width, height } = imageSize;
  const aspectRatio = width / height;

  return {
    height,
    width,
    aspectRatio,
  };
}
