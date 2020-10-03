import { NextApiRequest, NextApiResponse } from 'next';
import got from 'got';
import { sendAbuseReport } from '../../lib/slack-notifier';
/*
 *
 * curl -v -X POST https://api.airtable.com/v0/applm5lHINZUrlsjZ/Reported \
  -H "Authorization: Bearer key5eKUYTgmWYoLVt" \
  -H "Content-Type: application/json" \
  --data '{
  "records": [
    {
      "fields": {"playbackId": "1234", "reportedReason": "bad"}
    }
  ]
}'
 */

const notify = async ({playbackId, reason }: { playbackId: string, reason: string }) => {
  if (process.env.AIRTABLE_KEY && process.env.AIRTABLE_BASE_ID) {
    try {
      const resp = await got.post(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Reported`, {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_KEY}`
        },
        json: {
          records: [
            {fields: { playbackId, reason } },
          ]
        }
      });
      console.log('debug resp', resp.body);
    } catch (e) {
      console.error('Error reporting to airtable', e); // eslint-disable-line no-console
    }
  }
  try {
    await sendAbuseReport({ playbackId, reason });
  } catch (e) {
    console.error('Error reporting to slack', e); // eslint-disable-line no-console
  }
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { method } = req;

  switch (method) {
    case 'POST':
      await notify(req.body);
      res.json({ message: 'thank you' });
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
