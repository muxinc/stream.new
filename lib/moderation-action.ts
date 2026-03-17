import type { RobotsModerationOutputs } from '../types/robots';
import Mux from '@mux/mux-node';

const mux = new Mux();

async function saveDeletionRecordInAirtable ({ assetId, notes }: { assetId: string, notes: string }) {
  if (process.env.AIRTABLE_KEY && process.env.AIRTABLE_BASE_ID) {
    try {
      await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Auto Deleted`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {fields: { assetId, notes } },
          ]
        }),
      });
    } catch (e) {
      console.error('Error reporting to airtable', e); // eslint-disable-line no-console
    }
  }
}

export async function checkAndAutoDeleteWatchParty({ assetId, playbackId, answer, confidence }: { assetId: string, playbackId: string, answer: string, confidence: number }): Promise<boolean> {
  const autoDeleteEnabled = process.env.AUTO_DELETE_ENABLED === '1';
  const shouldDelete = answer === 'yes' && confidence > 0.8;

  if (autoDeleteEnabled && shouldDelete) {
    await mux.video.assets.deletePlaybackId(assetId, playbackId);

    await saveDeletionRecordInAirtable({
      assetId,
      notes: `Flagged by: AI watch-party detection — Answer: ${answer}, Confidence: ${confidence.toFixed(3)}`
    });

    return true;
  }

  return false;
}

export async function checkAndAutoDelete({ assetId, playbackId, moderationResult }: { assetId: string, playbackId: string, moderationResult: RobotsModerationOutputs }): Promise<boolean> {
  const autoDeleteEnabled = process.env.AUTO_DELETE_ENABLED === '1';
  const shouldDelete = moderationResult.exceedsThreshold;

  if (autoDeleteEnabled && shouldDelete) {
    await mux.video.assets.deletePlaybackId(assetId, playbackId);

    await saveDeletionRecordInAirtable({
      assetId,
      notes: `Sexual: ${moderationResult.maxScores.sexual}, Violence: ${moderationResult.maxScores.violence}`
    });

    return true;
  }

  return false;
}
