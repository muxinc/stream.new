import { NextRequest, NextResponse } from 'next/server';

const TELEMETRY_ENDPOINT = process.env.TELEMETRY_ENDPOINT;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const headers = request.headers;

  const telemetryData = {
    ...body,
    uploaderCountry: headers.get('x-vercel-ip-country'),
    uploaderCountryRegion: headers.get('x-vercel-ip-country-region'),
    userAgent: headers.get('user-agent'),
  };

  console.log(telemetryData);

  if (TELEMETRY_ENDPOINT) {
    const response = await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telemetryData)
    });
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } else {
    return NextResponse.json({
      message: 'Nothing happened because telemetry is not configured.',
    });
  }
}
