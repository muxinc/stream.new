import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux();

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const upload = await mux.video.uploads.retrieve(params.id);
    return NextResponse.json({
      upload: {
        status: upload.status,
        url: upload.url,
        asset_id: upload.asset_id,
      },
    });
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return NextResponse.json({ error: 'Error getting upload/asset' }, { status: 500 });
  }
}
