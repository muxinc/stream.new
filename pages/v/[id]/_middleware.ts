import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_KEY = 'streamPlayerType';

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const cookieFromRequest = request.cookies[COOKIE_KEY];

  if (!cookieFromRequest) {
    const selectedForExperiment = Math.random() <= 0.1;

    if (selectedForExperiment) {
      response.cookie(COOKIE_KEY, 'mux-player');
    } else {
      response.cookie(COOKIE_KEY, 'plyr');
    }
  }

  return response;
}