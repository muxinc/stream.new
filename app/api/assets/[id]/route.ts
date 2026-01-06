import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const asset = await mux.video.assets.retrieve(id);
    if (!(asset.playback_ids && asset.playback_ids[0])) {
      throw new Error('Error getting playback_id from asset');
    }
    return NextResponse.json({
      asset: {
        id: asset.id,
        status: asset.status,
        errors: asset.errors,
        playback_id: asset.playback_ids[0].id,
      },
    });
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return NextResponse.json({ error: 'Error getting upload/asset' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!process.env.SLACK_MODERATOR_PASSWORD) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  if (body.slack_moderator_password !== process.env.SLACK_MODERATOR_PASSWORD) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await mux.video.assets.delete(id);
    return new NextResponse(`Deleted ${id}`, { status: 200 });
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return new NextResponse('Error deleting asset', { status: 500 });
  }
}
