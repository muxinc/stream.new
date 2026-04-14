import { NextRequest, NextResponse } from 'next/server';
import { sendAbuseReport } from '../../../lib/slack-notifier';

const notify = async ({playbackId, reason, comment }: { playbackId: string, reason: string, comment?: string }) => {
  if (process.env.AIRTABLE_KEY && process.env.AIRTABLE_BASE_ID) {
    try {
      const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Reported`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {fields: { playbackId, reason, comment, status: "Pending" } },
          ]
        }),
      });
      if (!res.ok) {
        console.error('Airtable responded with', res.status, await res.text()); // eslint-disable-line no-console
      }
    } catch (e) {
      console.error('Error reporting to airtable', e); // eslint-disable-line no-console
    }
  }
  try {
    await sendAbuseReport({ playbackId, reason, comment });
  } catch (e) {
    console.error('Error reporting to slack', e); // eslint-disable-line no-console
  }
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  await notify(body);
  return NextResponse.json({ message: 'thank you' });
}
