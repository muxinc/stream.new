import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { start, resumeHook } from 'workflow/api';
import {
  moderateAndSummarize,
  moderationHookToken,
  summarizeHookToken,
  askQuestionsHookToken,
  captionHookToken,
} from '../../../../workflows/process-mux-ai';
import type { RobotsJobHookPayload, CaptionHookPayload } from '../../../../types';

const webhookSignatureSecret = process.env.MUX_WEBHOOK_SIGNATURE_SECRET;
const mux = new Mux();

type RobotsTerminalEventType = 
  Mux.Webhooks.RobotsJobAskQuestionsCancelledWebhookEvent
  | Mux.Webhooks.RobotsJobAskQuestionsErroredWebhookEvent
  | Mux.Webhooks.RobotsJobAskQuestionsCompletedWebhookEvent
  | Mux.Webhooks.RobotsJobFindKeyMomentsCancelledWebhookEvent
  | Mux.Webhooks.RobotsJobFindKeyMomentsErroredWebhookEvent
  | Mux.Webhooks.RobotsJobFindKeyMomentsCompletedWebhookEvent
  | Mux.Webhooks.RobotsJobGenerateChaptersCancelledWebhookEvent
  | Mux.Webhooks.RobotsJobGenerateChaptersErroredWebhookEvent
  | Mux.Webhooks.RobotsJobGenerateChaptersCompletedWebhookEvent
  | Mux.Webhooks.RobotsJobModerateCancelledWebhookEvent
  | Mux.Webhooks.RobotsJobModerateErroredWebhookEvent
  | Mux.Webhooks.RobotsJobModerateCompletedWebhookEvent
  | Mux.Webhooks.RobotsJobSummarizeCancelledWebhookEvent
  | Mux.Webhooks.RobotsJobSummarizeErroredWebhookEvent
  | Mux.Webhooks.RobotsJobSummarizeCompletedWebhookEvent
  | Mux.Webhooks.RobotsJobTranslateCaptionsCancelledWebhookEvent
  | Mux.Webhooks.RobotsJobTranslateCaptionsErroredWebhookEvent
  | Mux.Webhooks.RobotsJobTranslateCaptionsCompletedWebhookEvent;

// Robots job webhook data — we only read the fields we need. Everything else is
// ignored; the workflow calls `.retrieve()` for authoritative outputs rather than
// trusting the webhook body shape.
interface RobotsJobWebhookData {
  id: string;
  resources?: { assets: Array<{ id: string }> };
  errors?: Array<{ type: string; message: string; retryable?: boolean }>;
}

function buildRobotsHookPayload(data: RobotsJobWebhookData, terminalStatus: string): RobotsJobHookPayload {
  if (terminalStatus === 'errored') {
    return {
      status: 'errored',
      errorMessage: data.errors?.[0]?.message ?? 'Unknown error',
    };
  }
  if (terminalStatus === 'cancelled') {
    return { status: 'cancelled' };
  }
  return { status: 'completed' };
}

export async function POST(request: NextRequest) {
  // Get raw body as text (NOT json) for signature verification and parsing
  const rawBody = await request.text();

  // Verify webhook signature (required in production, optional in development)
  if (webhookSignatureSecret) {
    // Convert headers to plain object for Mux SDK
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    try {
      const event = await mux.webhooks.unwrap(rawBody, headers, webhookSignatureSecret);

      // Handle video.asset.ready - start unified AI workflow
      if (event.type === 'video.asset.ready') {
        const eventWithType = event as Mux.Webhooks.VideoAssetReadyWebhookEvent;
        const assetId = eventWithType.data.id;

        const workflowRun = await start(moderateAndSummarize, [assetId]);

        return NextResponse.json({
          message: 'AI workflow started',
          asset_id: assetId,
          workflow_id: workflowRun.runId
        });
      }
  
      // Handle Robots job terminal events — resume the workflow's matching hook.
      // Event type form: `robots.job.<workflow>.<status>`, e.g. `robots.job.moderate.completed`.
      // We only care about terminal statuses; pending/processing fall through.
      const robotsMatch = /^robots\.job\.(moderate|summarize|ask_questions)\.(completed|errored|cancelled)$/.exec(event.type);
      if (robotsMatch) {
        const eventWithType = event as RobotsTerminalEventType;
        const jobData = eventWithType.data;
        const assetId = jobData.resources?.assets?.[0]?.id;
        const workflow = jobData.workflow;
        const status = jobData.status;

        if (!assetId) {
          console.log(`Robots ${workflow} webhook missing resources.assets[0].id (job ${jobData.id})`); // eslint-disable-line no-console
          return NextResponse.json({ message: 'Robots event missing asset id' });
        }

        const token = 
          workflow === 'moderate' ? moderationHookToken(assetId)
          : workflow === 'summarize' ? summarizeHookToken(assetId)
          : askQuestionsHookToken(assetId);

        const payload = buildRobotsHookPayload(jobData, status);

        try {
          await resumeHook<RobotsJobHookPayload>(token, payload);
        } catch (e) {
          // Hook may not exist (stale workflow run, redelivered webhook after the workflow moved on, etc.)
          console.log(`Could not resume robots ${workflow} hook for asset ${assetId}: ${(e as Error).message}`); // eslint-disable-line no-console
        }

        return NextResponse.json({
          message: `Robots ${workflow} hook resumed (${status})`,
          asset_id: assetId,
          job_id: jobData.id,
        });
      }

      // Handle video.asset.track.ready — resume caption hook
      if (event.type === 'video.asset.track.ready') {
        const eventWithType = event as Mux.Webhooks.VideoAssetTrackReadyWebhookEvent;
        const track = eventWithType.data;

        if (track.type === 'text' && track.text_type === 'subtitles' && track.text_source === 'generated_vod') {
          const assetId = track.asset_id!; // our types currently don't mark asset_id as required
          const token = captionHookToken(assetId);

          try {
            await resumeHook<CaptionHookPayload>(token, { includeTranscript: true });
          } catch (e) {
            // Hook may not exist yet if captions arrived before workflow reached this point
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

      // Handle video.asset.track.errored — resume caption hook without transcript
      if (event.type === 'video.asset.track.errored') {
        const eventWithType = event as Mux.Webhooks.VideoAssetTrackErroredWebhookEvent;
        const track = eventWithType.data;

        if (track.type === 'text' && track.text_type === 'subtitles' && track.text_source === 'generated_vod') {
          const assetId = track.asset_id!; // our types currently don't mark asset_id as required
          const errorMessages: string[] = track.error?.messages || [];
          const token = captionHookToken(assetId);

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

      // Return 200 for unhandled event types to prevent Mux from retrying
      return NextResponse.json({ message: 'Event type not handled' });
    } catch (e) {
      console.error('Error handling webhook', e);
      return NextResponse.json(
        { message: (e as Error).message },
        { status: 400 }
      );
    }
  } else if (process.env.NODE_ENV === 'production') {
    console.error('MUX_WEBHOOK_SIGNATURE_SECRET is not set — rejecting webhook in production');
    return NextResponse.json(
      { message: 'Webhook signature verification is required in production' },
      { status: 500 }
    );
  } else {
    console.log('Skipping webhook sig verification because no secret is configured'); // eslint-disable-line no-console
  }
}
