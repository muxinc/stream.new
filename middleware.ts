import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STREAM_PLAYER_COOKIE_KEY = 'streamPlayerType';
const CHUNK_SIZE_COOKIE_KEY = 'dynamicChunkSize';

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const chunkSizeCookieFromRequest = request.cookies.get(CHUNK_SIZE_COOKIE_KEY);

  // Handle chunk size cookie experiment
  if (!chunkSizeCookieFromRequest) {
    const selectedForExperiment = Math.random() <= 0.2;

    if (selectedForExperiment) {
      response.cookies.set(CHUNK_SIZE_COOKIE_KEY, "true");
    } else {
      response.cookies.set(CHUNK_SIZE_COOKIE_KEY, "false");
    }
  }

  // For the playback paths, clear any old cookie that might have been used
  if (request.nextUrl.pathname.startsWith('/v')) {
    const streamPlayerCookieFromRequest = request.cookies.get(STREAM_PLAYER_COOKIE_KEY);

    if (streamPlayerCookieFromRequest) {
      response.cookies.delete(STREAM_PLAYER_COOKIE_KEY);
    }
  }

  return response;
}
