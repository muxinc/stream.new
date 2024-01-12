import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

const mux = new Mux();

export default async function assetHandler (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const asset = await mux.video.assets.retrieve(req.query.id as string);
        if (!(asset.playback_ids && asset.playback_ids[0])) {
          throw new Error('Error getting playback_id from asset');
        }
        res.json({
          asset: {
            id: asset.id,
            status: asset.status,
            errors: asset.errors,
            playback_id: asset.playback_ids[0].id,
          },
        });
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.json({ error: 'Error getting upload/asset' });
      }
      break;
    case 'DELETE':
      if (
        !process.env.SLACK_MODERATOR_PASSWORD
        || (req.body.slack_moderator_password !== process.env.SLACK_MODERATOR_PASSWORD)
      ) {
        res.status(401).end('Unauthorized');
        return;
      }

      try {
        await mux.video.assets.delete(req.query.id as string);
        res.status(200).end(`Deleted ${req.query.id}`);
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.end('Error deleting asset');
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
