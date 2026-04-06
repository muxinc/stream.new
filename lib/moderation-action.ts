import type { ModerateJobOutputs } from '@mux/mux-node/resources/robots/jobs/moderate';
import Mux from '@mux/mux-node';

const mux = new Mux();

async function saveDeletionRecordInAirtable ({ assetId, notes }: { assetId: string, notes: string }) {
  if (process.env.AIRTABLE_KEY && process.env.AIRTABLE_BASE_ID) {
    try {
      const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Auto Deleted`, {
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
      if (!res.ok) {
        console.error('Airtable responded with', res.status, await res.text()); // eslint-disable-line no-console
      }
    } catch (e) {
      console.error('Error reporting to airtable', e); // eslint-disable-line no-console
    }
  }
}

export async function checkAndAutoDeleteWatchParty({ assetId, playbackId, answer, confidence }: { assetId: string, playbackId: string, answer: string, confidence: number }): Promise<boolean> {
  const autoDeleteEnabled = process.env.AUTO_DELETE_ENABLED === '1';
  const shouldDelete = answer === 'yes' && confidence > 0.8;

  if (autoDeleteEnabled && shouldDelete) {
    await mux.video.assets.deletePlaybackId(playbackId, {ASSET_ID: assetId});

    await saveDeletionRecordInAirtable({
      assetId,
      notes: `Flagged by: AI watch-party detection — Answer: ${answer}, Confidence: ${confidence.toFixed(3)}`
    });

    return true;
  }

  return false;
}

export async function checkAndAutoDelete({ assetId, playbackId, moderationResult }: { assetId: string, playbackId: string, moderationResult: ModerateJobOutputs }): Promise<boolean> {
  const autoDeleteEnabled = process.env.AUTO_DELETE_ENABLED === '1';
  const shouldDelete = moderationResult.exceeds_threshold;

  if (autoDeleteEnabled && shouldDelete) {
    await mux.video.assets.deletePlaybackId(playbackId, {ASSET_ID: assetId});

    await saveDeletionRecordInAirtable({
      assetId,
      notes: `Sexual: ${moderationResult.max_scores.sexual}, Violence: ${moderationResult.max_scores.violence}`
    });

    return true;
  }

  return false;
}
