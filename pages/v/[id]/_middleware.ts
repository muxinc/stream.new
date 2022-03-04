import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_KEY = 'streamPlayerType';

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const cookieFromRequest = request.cookies[COOKIE_KEY];

  if (cookieFromRequest) {
    response.clearCookie(COOKIE_KEY);
  }

  return response;
}
