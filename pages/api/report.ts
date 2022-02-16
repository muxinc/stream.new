import { NextApiRequest, NextApiResponse } from 'next';
import { RequestError } from 'got';
import got from '../../lib/got-client';
import { sendAbuseReport } from '../../lib/slack-notifier';

const notify = async ({playbackId, reason, comment }: { playbackId: string, reason: string, comment?: string }) => {
  if (process.env.AIRTABLE_KEY && process.env.AIRTABLE_BASE_ID) {
    try {
      await got.post(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Reported`, {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_KEY}`
        },
        json: {
          records: [
            {fields: { playbackId, reason, comment, status: "Pending" } },
          ]
        }
      });
    } catch (e) {
      const err = (e as RequestError);
      console.error('Error reporting to airtable', err.response?.body, e); // eslint-disable-line no-console
    }
  }
  try {
    await sendAbuseReport({ playbackId, reason, comment });
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
