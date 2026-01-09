import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { sendSlackAssetReady, sendSlackAutoDeleteMessage } from '../../../../lib/slack-notifier';
import { getScores as moderationGoogle } from '../../../../lib/moderation-google';
import { getScores as moderationHive } from '../../../../lib/moderation-hive';
import { autoDelete } from '../../../../lib/moderation-action';

const webhookSignatureSecret = process.env.MUX_WEBHOOK_SIGNATURE_SECRET;
const mux = new Mux();

export async function POST(request: NextRequest) {
  // Get raw body as text (NOT json) for signature verification
  const rawBody = await request.text();

  // Verify signature
  if (webhookSignatureSecret) {
    // Convert headers to plain object for Mux SDK
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    try {
      mux.webhooks.verifySignature(rawBody, headers, webhookSignatureSecret);
    } catch (e) {
      console.error('Error verifyWebhookSignature - is the correct signature secret set?', e);
      return NextResponse.json(
        { message: (e as Error).message },
        { status: 400 }
      );
    }
  } else {
    console.log('Skipping webhook sig verification because no secret is configured'); // eslint-disable-line no-console
  }

  // Parse JSON AFTER verification
  const jsonBody = JSON.parse(rawBody);
  const { data, type } = jsonBody;

  if (type !== 'video.asset.ready') {
    return NextResponse.json({ message: 'thanks Mux' });
  }

  try {
    const assetId = data.id;
    const playbackId = data.playback_ids && data.playback_ids[0] && data.playback_ids[0].id;
    const duration = data.duration;

    const googleScores = await moderationGoogle ({ playbackId, duration });
    const hiveResult = await moderationHive ({ playbackId, duration });
    const hiveScores = hiveResult?.scores;
    const hiveTaskIds = hiveResult?.taskIds;

    const didAutoDelete = hiveScores ? (await autoDelete({ assetId, playbackId, hiveScores })) : false;

    if (didAutoDelete) {
      await sendSlackAutoDeleteMessage({ assetId, duration, hiveScores, hiveTaskIds });
      return NextResponse.json({ message: 'thanks Mux, I autodeleted this asset because it was bad' });
    } else {
      await sendSlackAssetReady({
        assetId,
        playbackId,
        duration,
        googleScores,
        hiveScores,
        hiveTaskIds,
      });
      return NextResponse.json({ message: 'thanks Mux, I notified myself about this' });
    }
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return NextResponse.json({ error: 'Error handling webhook' }, { status: 500 });
  }
}
