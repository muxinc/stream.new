import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

const { Video } = new Mux();

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { method, body } = req;

  switch (method) {
    case 'POST':
      try {
        const asset = await Video.Assets.create({
          // this is the text box contents from index.ts
          input: req.body,
          "playback_policy": [
            "public"
          ],
        });
        res.json({
          id: asset.id,
          status: asset.status,
        });
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.json({ error: 'Error creating asset' });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
