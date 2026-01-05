import { NextRequest, NextResponse } from 'next/server';
import { HOST_URL } from '../../../constants';
import { getImageDimensions } from '../../../lib/image-dimensions';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ message: 'url parameter is required' }, { status: 400 });
  }

  const [, playbackId] = url.match(/(?:v\/)(.*)(\/?)$/) || [];

  const imageSize = await getImageDimensions(playbackId);

  if (imageSize) {
    const imageUrl = `https://image.mux.com/${playbackId}/thumbnail.jpeg?width=480`;
    return NextResponse.json({
      title: 'Video uploaded to stream.new',
      type: 'video',
      height: imageSize.height,
      width: imageSize.width,
      version: '1.0',
      provider_name: 'stream.new',
      provider_url: HOST_URL,
      thumbnail_height: imageSize.height,
      thumbnail_width: imageSize.width,
      thumbnail_url: imageUrl,
      html: `<iframe width="${imageSize.width}" height="${imageSize.height}" src="${HOST_URL}/v/${playbackId}/embed" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
    });
  } else {
    return NextResponse.json({ message: 'not found' }, { status: 404 });
  }
}
