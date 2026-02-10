import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { start } from 'workflow/api';
import { processModeration, processSummaryAndQuestions } from '../../../../workflows/process-mux-ai';

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

  try {
    // Parse JSON inside try/catch to handle malformed payloads
    const jsonBody = JSON.parse(rawBody);
    const { data, type } = jsonBody;

    // Handle video.asset.ready - start moderation workflow
    if (type === 'video.asset.ready') {
      const assetId = data.id;

      // Start moderation workflow - returns immediately while processing continues in background
      const workflowRun = await start(processModeration, [assetId]);

      return NextResponse.json({
        message: 'Moderation workflow started',
        asset_id: assetId,
        workflow_id: workflowRun.runId
      });
    }

    // Handle video.asset.track.ready - start summarization workflow
    if (type === 'video.asset.track.ready') {
      const track = data;

      // Only process if this is a generated subtitle track
      if (track.type === 'text' && track.text_type === 'subtitles' && track.text_source === 'generated_vod') {
        const assetId = track.asset_id;

        const workflowRun = await start(processSummaryAndQuestions, [assetId]);

        return NextResponse.json({
          message: 'Summarization workflow started',
          asset_id: assetId,
          track_id: track.id,
          workflow_id: workflowRun.runId
        });
      }

      return NextResponse.json({ message: 'Track type not relevant for AI processing' });
    }

    // Handle video.asset.track.errored - if the track errored because there's no audio,
    // we still run summarization since @mux/ai will skip the text track if not present.
    if (type === 'video.asset.track.errored') {
      const track = data;

      if (track.type === 'text' && track.text_type === 'subtitles' && track.text_source === 'generated_vod') {
        const assetId = track.asset_id;
        const errorMessages = track.error?.messages || [];

        if (errorMessages.includes('Asset does not have an audio track')) {
          console.log(`Track errored for asset ${assetId} (no audio track), proceeding with summarization anyway`); // eslint-disable-line no-console

          const workflowRun = await start(processSummaryAndQuestions, [assetId, false]);

          return NextResponse.json({
            message: 'Summarization workflow started (track errored, no audio)',
            asset_id: assetId,
            track_id: track.id,
            workflow_id: workflowRun.runId
          });
        }

        console.log(`Track errored for asset ${assetId} with unhandled error, skipping: ${errorMessages.join(', ')}`); // eslint-disable-line no-console
        return NextResponse.json({ message: 'Track errored with unhandled error, skipping' });
      }

      return NextResponse.json({ message: 'Track type not relevant for AI processing' });
    }

    // Event type not handled
    return NextResponse.json({ message: 'Event type not handled' });
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return NextResponse.json({ error: 'Error handling webhook' }, { status: 500 });
  }
}
