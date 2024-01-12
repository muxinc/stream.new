import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

const mux = new Mux();

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const upload = await mux.video.uploads.retrieve(req.query.id as string);
        res.json({
          upload: {
            status: upload.status,
            url: upload.url,
            asset_id: upload.asset_id,
          },
        });
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.json({ error: 'Error getting upload/asset' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
