import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { start } from 'workflow/api';
import { moderateAndSummarize } from '../../../../workflows/process-mux-ai';

const webhookSignatureSecret = process.env.MUX_WEBHOOK_SIGNATURE_SECRET;
const mux = new Mux();

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

    // Return 200 for unhandled event types to prevent Mux from retrying
    return NextResponse.json({ message: 'Event type not handled' });
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return NextResponse.json({ error: 'Error handling webhook' }, { status: 500 });
  }
}
