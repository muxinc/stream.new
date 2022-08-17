import { NextApiRequest, NextApiResponse } from 'next';
import { processMuxWebhook } from '../../../lib/mux-webhook-processor';
import { verifySignature } from '@upstash/qstash/nextjs';

async function qstashWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method, body } = req;

  switch (method) {
    case 'POST': {
      try {
        await processMuxWebhook(body);
        res.json({ message: 'Success' });
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.json({ error: 'Error handling webhook' });
      }
      break;
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

// If QStash signing_keys are not defined in the env file, then it will respond back with error without processing the job
export default verifySignature(qstashWebhookHandler);
