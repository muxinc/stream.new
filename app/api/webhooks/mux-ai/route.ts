import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { start, resumeHook } from 'workflow/api';
import { moderateAndSummarize, captionHookToken } from '../../../../workflows/process-mux-ai';
import type { CaptionHookPayload } from '../../../../types';

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

    // Handle video.asset.ready - start unified AI workflow
    if (type === 'video.asset.ready') {
      const assetId = data.id;

      const workflowRun = await start(moderateAndSummarize, [assetId]);

      return NextResponse.json({
        message: 'AI workflow started',
        asset_id: assetId,
        workflow_id: workflowRun.runId
      });
    }

    // Handle video.asset.track.ready - resume caption hook
    if (type === 'video.asset.track.ready') {
      const track = data;

      if (track.type === 'text' && track.text_type === 'subtitles' && track.text_source === 'generated_vod') {
        const assetId = track.asset_id;
        const token = captionHookToken(assetId);

        try {
          await resumeHook<CaptionHookPayload>(token, { includeTranscript: true });
        } catch (e) {
          // Hook may not exist yet if captions arrived before workflow started
          console.log(`Could not resume caption hook for asset ${assetId}: ${(e as Error).message}`); // eslint-disable-line no-console
        }

        return NextResponse.json({
          message: 'Caption hook resumed',
          asset_id: assetId,
          track_id: track.id,
        });
      }

      return NextResponse.json({ message: 'Track type not relevant for AI processing' });
    }

    // Handle video.asset.track.errored - resume caption hook with appropriate includeTranscript
    if (type === 'video.asset.track.errored') {
      const track = data;

      if (track.type === 'text' && track.text_type === 'subtitles' && track.text_source === 'generated_vod') {
        const assetId = track.asset_id;
        const errorMessages: string[] = track.error?.messages || [];
        const token = captionHookToken(assetId);

        // If error is due to no audio or failed generation, proceed without transcript
        const isExpectedError = errorMessages.includes('Asset does not have an audio track') ||
          errorMessages.includes('Failed to generate caption track');

        if (isExpectedError) {
          console.log(`Track errored for asset ${assetId} (${errorMessages.join(', ')}), resuming hook without transcript`); // eslint-disable-line no-console
        } else {
          console.log(`Track errored for asset ${assetId} with unhandled error: ${errorMessages.join(', ')}`); // eslint-disable-line no-console
        }

        try {
          await resumeHook<CaptionHookPayload>(token, { includeTranscript: false });
        } catch (e) {
          console.log(`Could not resume caption hook for asset ${assetId}: ${(e as Error).message}`); // eslint-disable-line no-console
        }

        return NextResponse.json({
          message: 'Caption hook resumed (track errored)',
          asset_id: assetId,
          track_id: track.id,
        });
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
