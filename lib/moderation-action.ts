import type { ModerationResult } from '@mux/ai/workflows';
import Mux from '@mux/mux-node';
import { RequestError } from 'got';
import got from './got-client';

const mux = new Mux();

async function saveDeletionRecordInAirtable ({ assetId, notes }: { assetId: string, notes: string }) {
  if (process.env.AIRTABLE_KEY && process.env.AIRTABLE_BASE_ID) {
    try {
      await got.post(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Auto Deleted`, {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_KEY}`
        },
        json: {
          records: [
            {fields: { assetId, notes } },
          ]
        }
      });
    } catch (e) {
      const err = (e as RequestError);
      console.error('Error reporting to airtable', err.response?.body, e); // eslint-disable-line no-console
    }
  }
}

export async function checkAndAutoDelete({ assetId, playbackId, openaiResult, hiveResult }: { assetId: string, playbackId: string, openaiResult: ModerationResult, hiveResult: ModerationResult }): Promise<boolean> {
  const autoDeleteEnabled = process.env.AUTO_DELETE_ENABLED === '1';

  // Check if either moderation service flags the content
  const openaiExceeds = openaiResult.exceedsThreshold;
  const hiveExceeds = hiveResult.exceedsThreshold;
  const shouldDelete = openaiExceeds || hiveExceeds;

  if (autoDeleteEnabled && shouldDelete) {
    await mux.video.assets.deletePlaybackId(assetId, playbackId);

    const flaggedBy = [];
    if (openaiExceeds) flaggedBy.push('OpenAI');
    if (hiveExceeds) flaggedBy.push('Hive');

    await saveDeletionRecordInAirtable({
      assetId,
      notes: `Flagged by: ${flaggedBy.join(', ')} | OpenAI - Sexual: ${openaiResult.maxScores.sexual}, Violence: ${openaiResult.maxScores.violence} | Hive - Sexual: ${hiveResult.maxScores.sexual}, Violence: ${hiveResult.maxScores.violence}`
    });

    return true;
  }

  return false;
}
