import { NextApiRequest, NextApiResponse } from 'next';
import probe from 'probe-image-size';
import { HOST_URL } from '../../constants';

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { query } = req;

  const [, playbackId] = (query.url as string).match(/(?:v\/)(.*)(\/?)$/) || [];

  const imageUrl = `https://image.mux.com/${playbackId}/thumbnail.jpeg?width=480`;
  const imageSize = await probe(imageUrl);

  const escapedSrc = escape(`${HOST_URL}/v/${playbackId}/embed`);

  res.json({
    type: 'video',
    title: 'Video uploaded to stream.new',
    height: imageSize.height,
    width: imageSize.width,
    version: '1.0',
    provider_name: 'stream.new',
    provider_url: HOST_URL,
    thumbnail_height: imageSize.height,
    thumbnail_width: imageSize.width,
    thumbnail_url: imageUrl,
    html: `<iframe width="${imageSize.width}" height="${imageSize.height}" src="${escapedSrc}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
  });
};
