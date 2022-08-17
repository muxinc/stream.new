import {
  sendSlackAssetReady,
  sendSlackAutoDeleteMessage,
} from './slack-notifier';
import { getScores as moderationGoogle } from './moderation-google';
import { getScores as moderationHive } from './moderation-hive';
import { autoDelete } from './moderation-action';

type WebhookRequestBody = {
  type: string;
  object: any;
  id: string;
  environment: any;
  data: any;
  playback_ids?: any[];
  duration: number;
  created_at: string;
  accessor_source: string;
  accessor: string;
  request_id: string;
}

export async function processMuxWebhook(data: WebhookRequestBody): Promise<boolean> {
  const assetId = data.id;
  const playbackId =
    data.playback_ids && data.playback_ids[0] && data.playback_ids[0].id;
  const duration = data.duration;

  const googleScores = await moderationGoogle({ playbackId, duration });
  const hiveScores = await moderationHive({ playbackId, duration });

  const didAutoDelete = hiveScores
    ? await autoDelete({ assetId, playbackId, hiveScores })
    : false;

  if (didAutoDelete) {
    await sendSlackAutoDeleteMessage({ assetId, duration, hiveScores });
    console.log('Auto deleted this asset because it was bad');
  } else {
    await sendSlackAssetReady({
      assetId,
      playbackId,
      duration,
      googleScores,
      hiveScores,
    });
    console.log('Notified myself about this');
  }
  return true;
}
