import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/ts';
import { pickUploadVideoQuality } from '../../../lib/upload-quality';
import logger from '../../../lib/logger';

const mux = new Mux();

export async function POST(_request: NextRequest) {
  try {
    const videoQuality = pickUploadVideoQuality();
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: videoQuality,

        inputs: [
          {
            generated_subtitles: [
              {
                language_code: 'auto',
              },
            ],
          },
        ],
      },
      cors_origin: '*',
    });
    // Logged so the uploads behind MPEG-TS playback are findable in the
    // Vercel logs (see PLUS_UPLOAD_PERCENT in README_INTERNAL.md).
    if (videoQuality !== 'basic') {
      logger(`upload ${upload.id} created with video_quality=${videoQuality}`);
    }
    return NextResponse.json({
      id: upload.id,
      url: upload.url,
    });
  } catch (e) {
    console.error('Request error', e); // eslint-disable-line no-console
    return NextResponse.json(
      { error: 'Error creating upload' },
      { status: 500 }
    );
  }
}
