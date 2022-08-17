import { NextApiRequest, NextApiResponse } from 'next';
import { sendSlackAssetReady, sendSlackAutoDeleteMessage } from '../../../lib/slack-notifier';
import { getScores as moderationGoogle } from '../../../lib/moderation-google';
import { getScores as moderationHive } from '../../../lib/moderation-hive';
import { autoDelete } from '../../../lib/moderation-action';
import { verifySignature } from "@upstash/qstash/nextjs";


async function qstashWebhookHandler (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method, body } = req;

  switch (method) {
    case 'POST': {
      const { data, type } = body;

      if (type !== 'video.asset.ready') {
        res.json({ message: 'Success!' });
        return;
      }
      try {
        const assetId = data.id;
        const playbackId = data.playback_ids && data.playback_ids[0] && data.playback_ids[0].id;
        const duration = data.duration;

        const googleScores = await moderationGoogle ({ playbackId, duration });
        const hiveScores = await moderationHive ({ playbackId, duration });

        const didAutoDelete = hiveScores ? (await autoDelete({ assetId, playbackId, hiveScores })) : false;

        if (didAutoDelete) {
          await sendSlackAutoDeleteMessage({ assetId, duration, hiveScores });
          console.log('Auto deleted this asset because it was bad');
          res.json({ message: 'Success!' });
        } else {
          await sendSlackAssetReady({
            assetId,
            playbackId,
            duration,
            googleScores,
            hiveScores,
          });
          console.log('Notified myself about this');
          res.json({ message: 'Success' });
        }
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.json({ error: 'Error handling webhook' });
      }
      break;
    } default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default verifySignature(qstashWebhookHandler);
