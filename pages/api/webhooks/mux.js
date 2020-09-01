import Mux from '@mux/mux-node';
import { buffer } from 'micro';
import got from 'got';

const slackWebhook = process.env.SLACK_WEBHOOK_ASSET_READY;
const webhookSignatureSecret = process.env.MUX_WEBHOOK_SIGNATURE_SECRET;

const sendSlackWebhook = async ({ playbackId, assetId }) => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return Promise.resolve();
  }
  return got.post(slackWebhook, {
    json: {
      text: `New video created on stream.new. <https://stream.new/v/${playbackId}|View on stream.new>`,
      icon_emoji: 'tv',
      attachments: [
        {
          fallback: 'New video ready on stream.new',
          fields: [
            {
              title: 'Asset ID',
              value: assetId,
              short: false,
            },
            {
              title: 'Playback ID',
              value: playbackId,
              short: false,
            },
          ],
          image_url: `https://image.mux.com/${playbackId}/thumbnail.png`,
        },
      ],
    },
  });
};

const verifyWebhookSignature = async (rawBody, req) => {
  if (webhookSignatureSecret) {
    return Mux.Webhooks.verifyHeader(rawBody, req.headers['mux-signature'], webhookSignatureSecret);
  }
  console.log('Skipping webhook sig verification because no secret is configured'); // eslint-disable-line no-console
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

export default async function muxWebhookHandler (req, res) {
  const { method } = req;

  switch (method) {
    case 'POST': {
      const rawBody = (await buffer(req)).toString();
      const isValid = await verifyWebhookSignature(rawBody, req);
      if (!isValid) {
        res.status(400).json({ message: 'signature not verified' });
        return;
      }
      const jsonBody = JSON.parse(rawBody);
      const { data, type } = jsonBody;

      if (type !== 'video.asset.ready') {
        res.json({ message: 'thanks Mux' });
        return;
      }
      try {
        await sendSlackWebhook({
          assetId: data.id,
          playbackId: data.playback_ids && data.playback_ids[0] && data.playback_ids[0].id,
        });
        res.json({ message: 'thanks Mux, I notified myself about this' });
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.json({ error: 'Error creating upload' });
      }
      break;
    } default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
