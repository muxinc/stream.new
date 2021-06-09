import { ModerationScores } from '../types';
import Mux from '@mux/mux-node';
import got from 'got';

const { Video } = new Mux();

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
      console.error('Error reporting to airtable', e.response && e.response.body, e); // eslint-disable-line no-console
    }
  }
}

export async function autoDelete({ assetId, playbackId, hiveScores }: { assetId: string, playbackId: string, hiveScores: ModerationScores }): Promise<boolean> {
  if (hiveScores && hiveScores.adult && hiveScores.adult >= 0.95) {
    await Video.Assets.deletePlaybackId(assetId, playbackId);
    await saveDeletionRecordInAirtable({ assetId, notes: JSON.stringify(hiveScores) });

    return true;
  }

  return false;
}
