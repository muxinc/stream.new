import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

const mux = new Mux();

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const upload = await mux.video.uploads.create({
          new_asset_settings: { playback_policy: ['public'] },
          cors_origin: '*'
        });
        res.json({
          id: upload.id,
          url: upload.url,
        });
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.json({ error: 'Error creating upload' });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
