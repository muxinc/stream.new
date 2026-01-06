import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { start } from 'workflow/api';
import { processMuxAI } from '../../../../workflows/process-mux-ai';

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
    return NextResponse.json({ message: 'Event type not handled' });
  }

  try {
    const assetId = data.id;

    // Start durable workflow - returns immediately while processing continues in background
    const workflowRun = await start(processMuxAI, [assetId]);

    // Return immediately
    return NextResponse.json({
      message: 'AI analysis workflow started',
      asset_id: assetId,
      workflow_id: workflowRun.runId
    });
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return NextResponse.json({ error: 'Error handling webhook' }, { status: 500 });
  }
}
