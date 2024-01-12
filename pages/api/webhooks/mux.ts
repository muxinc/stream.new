import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';
import { buffer } from 'micro';
import { sendSlackAssetReady, sendSlackAutoDeleteMessage } from '../../../lib/slack-notifier';
import { getScores as moderationGoogle } from '../../../lib/moderation-google';
import { getScores as moderationHive } from '../../../lib/moderation-hive';
import { autoDelete } from '../../../lib/moderation-action';

const webhookSignatureSecret = process.env.MUX_WEBHOOK_SIGNATURE_SECRET;
const mux = new Mux();

const verifyWebhookSignature = (rawBody: string | Buffer, req: NextApiRequest) => {
  if (webhookSignatureSecret) {
    // this will raise an error if signature is not valid
    mux.webhooks.verifySignature(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody, req.headers, webhookSignatureSecret)
  } else {
    console.log('Skipping webhook sig verification because no secret is configured'); // eslint-disable-line no-console
  }
  return true;
};

//
// By default, NextJS will look at the content type and intelligently parse the body
// This is great. Except that for webhooks we need access to the raw body if we want
// to do signature verification
//
// By setting bodyParser: false here we have to extract the rawBody as a string
// and use JSON.parse on it manually.
//
// If we weren't doing webhook signature verification then the code can get a bit simpler
//
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function muxWebhookHandler (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  switch (method) {
    case 'POST': {
      const rawBody = (await buffer(req)).toString();
      try {
        verifyWebhookSignature(rawBody, req);
      } catch (e) {
        console.error('Error verifyWebhookSignature - is the correct signature secret set?', e);
        res.status(400).json({ message: (e as Error).message });
        return;
      }
      const jsonBody = JSON.parse(rawBody);
      const { data, type } = jsonBody;

      if (type !== 'video.asset.ready') {
        res.json({ message: 'thanks Mux' });
        return;
      }
      try {
        const assetId = data.id;
        const playbackId = data.playback_ids && data.playback_ids[0] && data.playback_ids[0].id;
        const duration = data.duration;

        const googleScores = await moderationGoogle ({ playbackId, duration });
        const hiveResult = await moderationHive ({ playbackId, duration });
        const hiveScores = hiveResult?.scores;
        const hiveTaskIds = hiveResult?.taskIds;

        const didAutoDelete = hiveScores ? (await autoDelete({ assetId, playbackId, hiveScores })) : false;

        if (didAutoDelete) {
          await sendSlackAutoDeleteMessage({ assetId, duration, hiveScores, hiveTaskIds });
          res.json({ message: 'thanks Mux, I autodeleted this asset because it was bad' });
        } else {
          await sendSlackAssetReady({
            assetId,
            playbackId,
            duration,
            googleScores,
            hiveScores,
            hiveTaskIds,
          });
          res.json({ message: 'thanks Mux, I notified myself about this' });
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
