const ROBOTS_API_URL = 'https://api.mux.com/robots/v1';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

type FetchFn = typeof globalThis.fetch;

function toBase64(str: string): string {
  let result = '';
  let i = 0;
  const len = str.length;
  while (i < len) {
    const remaining = len - i;
    const a = str.charCodeAt(i++);
    const b = i < len ? str.charCodeAt(i++) : 0;
    const c = i < len ? str.charCodeAt(i++) : 0;
    const triplet = (a << 16) | (b << 8) | c;
    result += BASE64_CHARS[(triplet >> 18) & 0x3f];
    result += BASE64_CHARS[(triplet >> 12) & 0x3f];
    result += remaining > 1 ? BASE64_CHARS[(triplet >> 6) & 0x3f] : '=';
    result += remaining > 2 ? BASE64_CHARS[triplet & 0x3f] : '=';
  }
  return result;
}

function getAuthHeader(): string {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  return `Basic ${toBase64(`${tokenId}:${tokenSecret}`)}`;
}

function robotsUrl(path: string): string {
  return `${ROBOTS_API_URL}${path}`;
}

async function fetchJson<T>(fetchFn: FetchFn, url: string, options: RequestInit): Promise<T> {
  const response = await fetchFn(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function createModerationJob(
  fetchFn: FetchFn,
  assetId: string,
  options?: {
    thresholds?: { sexual?: number; violence?: number };
    maxSamples?: number;
  }
): Promise<{ jobId: string }> {
  const body = await fetchJson<{ data: { id: string } }>(fetchFn, robotsUrl('/jobs/moderate'), {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parameters: {
        asset_id: assetId,
        ...(options?.thresholds && { thresholds: options.thresholds }),
        ...(options?.maxSamples && { max_samples: options.maxSamples }),
      },
    }),
  });

  return { jobId: body.data.id };
}

export async function createSummarizeJob(
  fetchFn: FetchFn,
  assetId: string,
  options?: {
    tone?: 'neutral' | 'playful' | 'professional';
  }
): Promise<{ jobId: string }> {
  const body = await fetchJson<{ data: { id: string } }>(fetchFn, robotsUrl('/jobs/summarize'), {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parameters: {
        asset_id: assetId,
        ...(options?.tone && { tone: options.tone }),
      },
    }),
  });

  return { jobId: body.data.id };
}

export async function createAskQuestionsJob(
  fetchFn: FetchFn,
  assetId: string,
  questions: Array<{ question: string }>
): Promise<{ jobId: string }> {
  const body = await fetchJson<{ data: { id: string } }>(fetchFn, robotsUrl('/jobs/ask-questions'), {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parameters: {
        asset_id: assetId,
        questions,
      },
    }),
  });

  return { jobId: body.data.id };
}

export interface RobotsJobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'errored' | 'cancelled';
  outputs?: Record<string, unknown>;
  errors?: Array<{ type: string; message: string }>;
}

export async function getJobStatus(
  fetchFn: FetchFn,
  workflow: string,
  jobId: string
): Promise<RobotsJobStatus> {
  const body = await fetchJson<{ data: RobotsJobStatus }>(fetchFn, robotsUrl(`/jobs/${workflow}/${jobId}`), {
    method: 'GET',
    headers: { Authorization: getAuthHeader() },
  });

  return body.data;
}
