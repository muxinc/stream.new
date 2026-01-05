import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux();

export async function POST(_request: NextRequest) {
  try {
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'basic',
        static_renditions: [
          {
            resolution: 'audio-only'
          }
        ]
      },
      cors_origin: '*'
    });
    return NextResponse.json({
      id: upload.id,
      url: upload.url,
    });
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return NextResponse.json({ error: 'Error creating upload' }, { status: 500 });
  }
}
