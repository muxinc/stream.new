import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { start, resumeHook } from 'workflow/api';
import {
  moderateAndSummarize,
  moderationHookToken,
  summarizeHookToken,
  askQuestionsHookToken,
} from '../../../../workflows/process-mux-ai';
import type {
  ModerationHookPayload,
  SummarizeHookPayload,
  AskQuestionsHookPayload,
} from '../../../../types';

const webhookSignatureSecret = process.env.MUX_WEBHOOK_SIGNATURE_SECRET;
const mux = new Mux();

type RobotsJobStatus = 'completed' | 'errored' | 'cancelled';

// Robots job webhook data has this shape (see https://www.mux.com/webhook-spec.json).
// We only care about the fields we use — everything else is passed through untouched.
interface RobotsJobWebhookData {
  id: string;
  status: RobotsJobStatus | 'pending' | 'processing';
  parameters: { asset_id: string };
  outputs?: unknown;
  errors?: Array<{ type: string; message: string; retryable?: boolean }>;
}

function buildRobotsHookPayload(data: RobotsJobWebhookData, terminalStatus: RobotsJobStatus) {
  if (terminalStatus === 'completed') {
    return { status: 'completed' as const, outputs: data.outputs };
  }
  if (terminalStatus === 'errored') {
    return {
      status: 'errored' as const,
      errorMessage: data.errors?.[0]?.message ?? 'Unknown error',
    };
  }
  return { status: 'cancelled' as const };
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
      mux.webhooks.verifySignature(rawBody, headers, webhookSignatureSecret);
    } catch (e) {
      console.error('Error verifyWebhookSignature - is the correct signature secret set?', e);
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

    // Handle Robots job terminal events — resume the workflow's corresponding hook.
    //
    // Event types are of the form `robots.job.<workflow>.<status>`, e.g.
    // `robots.job.moderate.completed`. We only care about terminal statuses
    // (completed / errored / cancelled) because those are what the workflow awaits.
    const robotsMatch = /^robots\.job\.(moderate|summarize|ask_questions)\.(completed|errored|cancelled)$/.exec(type);
    if (robotsMatch) {
      const [, workflow, status] = robotsMatch as unknown as [string, 'moderate' | 'summarize' | 'ask_questions', RobotsJobStatus];
      const jobData = data as RobotsJobWebhookData;
      const assetId = jobData.parameters?.asset_id;

      if (!assetId) {
        console.log(`Robots ${workflow} webhook missing parameters.asset_id (job ${jobData.id})`); // eslint-disable-line no-console
        return NextResponse.json({ message: 'Robots event missing asset id' });
      }

      try {
        if (workflow === 'moderate') {
          const payload = buildRobotsHookPayload(jobData, status) as ModerationHookPayload;
          await resumeHook<ModerationHookPayload>(moderationHookToken(assetId), payload);
        } else if (workflow === 'summarize') {
          const payload = buildRobotsHookPayload(jobData, status) as SummarizeHookPayload;
          await resumeHook<SummarizeHookPayload>(summarizeHookToken(assetId), payload);
        } else {
          const payload = buildRobotsHookPayload(jobData, status) as AskQuestionsHookPayload;
          await resumeHook<AskQuestionsHookPayload>(askQuestionsHookToken(assetId), payload);
        }
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

    // Return 200 for unhandled event types to prevent Mux from retrying
    return NextResponse.json({ message: 'Event type not handled' });
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return NextResponse.json({ error: 'Error handling webhook' }, { status: 500 });
  }
}
