import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PLYR_TYPE, MUX_PLAYER_TYPE } from '../../../constants';

const COOKIE_KEY = 'streamPlayerType';
const SPLIT_PERCENTAGE = 0.1;

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const cookieFromRequest = request.cookies[COOKIE_KEY];

  if (!cookieFromRequest) {
    const selectedForExperiment = Math.random() <= SPLIT_PERCENTAGE;

    if (selectedForExperiment) {
      response.cookie(COOKIE_KEY, MUX_PLAYER_TYPE);
    } else {
      response.cookie(COOKIE_KEY, PLYR_TYPE);
    }
  }

  return response;
}
