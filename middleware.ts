import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DYNAMIC_CHUNK_SIZE_COOKIE = 'dynamicChunkSize';
const STREAM_PLAYER_TYPE_COOKIE = 'streamPlayerType';

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  
  // Apply dynamic chunk size cookie logic to all pages
  const dynamicChunkCookie = request.cookies.get(DYNAMIC_CHUNK_SIZE_COOKIE);
  
  if (!dynamicChunkCookie) {
    const selectedForExperiment = Math.random() <= 0.2;
    
    if (selectedForExperiment) {
      response.cookies.set(DYNAMIC_CHUNK_SIZE_COOKIE, "true");
    } else {
      response.cookies.set(DYNAMIC_CHUNK_SIZE_COOKIE, "false");
    }
  }
  
  // Apply stream player type cookie deletion for /v/[id] routes
  if (request.nextUrl.pathname.startsWith('/v/')) {
    const streamPlayerCookie = request.cookies.get(STREAM_PLAYER_TYPE_COOKIE);
    
    if (streamPlayerCookie) {
      response.cookies.delete(STREAM_PLAYER_TYPE_COOKIE);
    }
  }

  return response;
}
