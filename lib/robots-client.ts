const ROBOTS_API_URL = 'https://api.mux.com/robots/v1';

type FetchFn = typeof globalThis.fetch;

function robotsUrl(path: string): string {
  return `${ROBOTS_API_URL}${path}`;
}

async function fetchJson<T>(fetchFn: FetchFn, url: string, options: RequestInit): Promise<T> {
  const response = await fetchFn(url, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${body}`);
  }
  return response.json() as Promise<T>;
}

export async function createModerationJob(
  fetchFn: FetchFn,
  authHeader: string,
  assetId: string,
  options?: {
    thresholds?: { sexual?: number; violence?: number };
    maxSamples?: number;
  }
): Promise<{ jobId: string }> {
  const body = await fetchJson<{ data: { id: string } }>(fetchFn, robotsUrl('/jobs/moderate'), {
    method: 'POST',
    headers: {
      Authorization: authHeader,
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
  authHeader: string,
  assetId: string,
  options?: {
    tone?: 'neutral' | 'playful' | 'professional';
  }
): Promise<{ jobId: string }> {
  const body = await fetchJson<{ data: { id: string } }>(fetchFn, robotsUrl('/jobs/summarize'), {
    method: 'POST',
    headers: {
      Authorization: authHeader,
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
  authHeader: string,
  assetId: string,
  questions: Array<{ question: string }>
): Promise<{ jobId: string }> {
  const body = await fetchJson<{ data: { id: string } }>(fetchFn, robotsUrl('/jobs/ask-questions'), {
    method: 'POST',
    headers: {
      Authorization: authHeader,
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
  authHeader: string,
  workflow: string,
  jobId: string
): Promise<RobotsJobStatus> {
  const body = await fetchJson<{ data: RobotsJobStatus }>(fetchFn, robotsUrl(`/jobs/${workflow}/${jobId}`), {
    method: 'GET',
    headers: { Authorization: authHeader },
  });

  return body.data;
}
