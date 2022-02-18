import { NextApiRequest, NextApiResponse } from 'next';
import { HOST_URL } from '../../constants';
import { getImageDimensions } from '../../lib/image-dimensions';

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { query } = req;

  const [, playbackId] = (query.url as string).match(/(?:v\/)(.*)(\/?)$/) || [];

  const imageSize = await getImageDimensions(playbackId);

  if (imageSize) {
    const imageUrl = `https://image.mux.com/${playbackId}/thumbnail.jpeg?width=480`;
    res.json({
      title: 'Video uploaded to stream.new',
      type: 'video',
      height: imageSize.height,
      width: imageSize.width,
      version: '1.0',
      provider_name: 'stream.new',
      provider_url: HOST_URL,
      thumbnail_height: imageSize.height,
      thumbnail_width: imageSize.width,
      thumbnail_url: imageUrl,
      html: `<iframe width="${imageSize.width}" height="${imageSize.height}" src="${HOST_URL}/v/${playbackId}/embed" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
    });
  } else {
    res.status(404).json({ message: 'not found' });
  }
};
