import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';
import { buffer } from 'micro';
import { Client } from "@upstash/qstash";

const webhookSignatureSecret = process.env.MUX_WEBHOOK_SIGNATURE_SECRET;
const qstashTopic = process.env.QSTASH_TOPIC;
const qstashToken = process.env.QSTASH_TOKEN;

const verifyWebhookSignature = (rawBody: string | Buffer, req: NextApiRequest) => {
  if (webhookSignatureSecret) {
    // this will raise an error if signature is not valid
    Mux.Webhooks.verifyHeader(rawBody, req.headers['mux-signature'] as string, webhookSignatureSecret);
  } else {
    console.log('Skipping webhook sig verification because no secret is configured'); // eslint-disable-line no-console
  }
  return true;
};

const scheduleAsyncJob = async (rawBody: string) => {
  const qstashClient = new Client({
    token: `${qstashToken}`,
  });
  return await qstashClient.publishJSON({
    url: qstashTopic,
    body: rawBody,
  });
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

      try {
        const { messageId } = await scheduleAsyncJob(rawBody);
        console.log('qstash messageId: ', messageId);
        res.json({ message: 'Thanks Mux, webhook received.' });
      } catch (e) {
        console.error('Error in muxWebhookReceiver, qstash response: ', e);
        res.status(400).json({ message: 'Error handling webhook.' });
      }
      break;
    } default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
