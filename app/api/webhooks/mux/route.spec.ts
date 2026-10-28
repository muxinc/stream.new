/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { resumeHook, start } from 'workflow/api';

jest.mock('workflow/api', () => ({
  start: jest.fn(),
  resumeHook: jest.fn(),
}));

jest.mock('../../../../workflows/process-mux-ai', () => ({
  moderateAndSummarize: jest.fn(),
  moderationHookToken: (assetId: string) => `robots-moderate:${assetId}`,
  summarizeHookToken: (assetId: string) => `robots-summarize:${assetId}`,
  askQuestionsHookToken: (assetId: string) => `robots-ask-questions:${assetId}`,
  captionHookToken: (assetId: string) => `captions:${assetId}`,
}));

const assetId = 'test-asset-123';

let POST: (request: NextRequest) => Promise<Response>;

beforeAll(async () => {
  process.env.MUX_TOKEN_ID = 'test-token-id';
  process.env.MUX_TOKEN_SECRET = 'test-token-secret';
  ({ POST } = await import('./route'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

function robotsEvent(type: string, workflow: string, status: string, extra: Record<string, unknown> = {}) {
  return {
    type,
    data: { id: 'job-1', workflow, status, resources: { assets: [{ id: assetId }] }, ...extra },
  };
}

function post(event: unknown) {
  return POST(
    new NextRequest('http://localhost/api/webhooks/mux', {
      method: 'POST',
      body: JSON.stringify(event),
    })
  );
}

describe.each(['robots.job', 'robots.v1.job'])('%s terminal events', (prefix) => {
  test.each([
    ['moderate', 'moderate', `robots-moderate:${assetId}`],
    ['summarize', 'summarize', `robots-summarize:${assetId}`],
    ['ask_questions', 'ask-questions', `robots-ask-questions:${assetId}`],
  ])('%s.completed resumes the matching hook', async (eventWorkflow, workflow, token) => {
    await post(robotsEvent(`${prefix}.${eventWorkflow}.completed`, workflow, 'completed'));

    expect(resumeHook).toHaveBeenCalledWith(token, { status: 'completed' });
  });

  test('errored passes the first error message', async () => {
    await post(
      robotsEvent(`${prefix}.moderate.errored`, 'moderate', 'errored', {
        errors: [{ type: 'processing_error', message: 'boom' }],
      })
    );

    expect(resumeHook).toHaveBeenCalledWith(`robots-moderate:${assetId}`, {
      status: 'errored',
      errorMessage: 'boom',
    });
  });

  test('cancelled resumes with cancelled', async () => {
    await post(robotsEvent(`${prefix}.summarize.cancelled`, 'summarize', 'cancelled'));

    expect(resumeHook).toHaveBeenCalledWith(`robots-summarize:${assetId}`, { status: 'cancelled' });
  });

  test('non-terminal statuses are ignored', async () => {
    await post(robotsEvent(`${prefix}.moderate.processing`, 'moderate', 'processing'));

    expect(resumeHook).not.toHaveBeenCalled();
  });

  test('workflows the pipeline does not run are ignored', async () => {
    await post(robotsEvent(`${prefix}.generate_chapters.completed`, 'generate-chapters', 'completed'));

    expect(resumeHook).not.toHaveBeenCalled();
  });

  test('events without an asset id do not resume a hook', async () => {
    await post({
      type: `${prefix}.moderate.completed`,
      data: { id: 'job-1', workflow: 'moderate', status: 'completed' },
    });

    expect(resumeHook).not.toHaveBeenCalled();
  });
});

test('video.asset.ready starts the AI workflow', async () => {
  (start as jest.Mock).mockResolvedValue({ runId: 'run-1' });

  await post({ type: 'video.asset.ready', data: { id: assetId } });

  expect(start).toHaveBeenCalledWith(expect.anything(), [assetId]);
  expect(resumeHook).not.toHaveBeenCalled();
});
