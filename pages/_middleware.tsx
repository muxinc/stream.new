import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_KEY = 'dynamicChunkSize';

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const cookieFromRequest = request.cookies[COOKIE_KEY];

  if (!cookieFromRequest) {
    const selectedForExperiment = Math.random() <= 0.2;

    if (selectedForExperiment) {
      response.cookie(COOKIE_KEY, "true");
    } else {
      response.cookie(COOKIE_KEY, "false");
    }
  }

  return response;
}
