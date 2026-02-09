/**
 * @jest-environment node
 */
import nock from 'nock';
import { checkAndAutoDelete } from './moderation-action';
import type { ModerationResult } from '@mux/ai/workflows';

const assetId = 'test-asset-123';
const playbackId = 'test-playback-456';

beforeEach(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
  delete process.env.AUTO_DELETE_ENABLED;
});

test('returns false when AUTO_DELETE_ENABLED is not set, even if both providers exceed', async () => {
  const openaiResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: true,
    maxScores: { sexual: 0.95, violence: 0.92 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };
  const hiveResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: true,
    maxScores: { sexual: 0.96, violence: 0.88 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    openaiResult,
    hiveResult,
  });

  expect(didDelete).toBe(false);
});

test('deletes and records when AUTO_DELETE_ENABLED=1 and both providers exceed', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const scopeMux = nock('https://api.mux.com')
    .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
    .reply(204);

  const scopeAirtable = nock('https://api.airtable.com')
    .post(`/v0/${process.env.AIRTABLE_BASE_ID}/Auto%20Deleted`)
    .reply(200, { records: [] });

  const openaiResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: true,
    maxScores: { sexual: 0.95, violence: 0.92 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };
  const hiveResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: true,
    maxScores: { sexual: 0.96, violence: 0.88 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    openaiResult,
    hiveResult,
  });

  expect(didDelete).toBe(true);
  expect(scopeMux.isDone()).toBe(true);
  expect(scopeAirtable.isDone()).toBe(true);
});

test('deletes when only OpenAI exceeds threshold', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const scopeMux = nock('https://api.mux.com')
    .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
    .reply(204);

  const scopeAirtable = nock('https://api.airtable.com')
    .post(`/v0/${process.env.AIRTABLE_BASE_ID}/Auto%20Deleted`)
    .reply(200, { records: [] });

  const openaiResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: true,
    maxScores: { sexual: 0.95, violence: 0.92 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };
  const hiveResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: false,
    maxScores: { sexual: 0.50, violence: 0.30 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    openaiResult,
    hiveResult,
  });

  expect(didDelete).toBe(true);
  expect(scopeMux.isDone()).toBe(true);
  expect(scopeAirtable.isDone()).toBe(true);
});

test('deletes when only Hive exceeds threshold', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const scopeMux = nock('https://api.mux.com')
    .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
    .reply(204);

  const scopeAirtable = nock('https://api.airtable.com')
    .post(`/v0/${process.env.AIRTABLE_BASE_ID}/Auto%20Deleted`)
    .reply(200, { records: [] });

  const openaiResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: false,
    maxScores: { sexual: 0.40, violence: 0.25 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };
  const hiveResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: true,
    maxScores: { sexual: 0.96, violence: 0.88 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    openaiResult,
    hiveResult,
  });

  expect(didDelete).toBe(true);
  expect(scopeMux.isDone()).toBe(true);
  expect(scopeAirtable.isDone()).toBe(true);
});

test('does not delete when neither provider exceeds threshold', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const openaiResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: false,
    maxScores: { sexual: 0.40, violence: 0.25 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };
  const hiveResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: false,
    maxScores: { sexual: 0.50, violence: 0.30 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    openaiResult,
    hiveResult,
  });

  expect(didDelete).toBe(false);
});

test('still returns true if Airtable recording fails', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const scopeMux = nock('https://api.mux.com')
    .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
    .reply(204);

  const scopeAirtable = nock('https://api.airtable.com')
    .post(`/v0/${process.env.AIRTABLE_BASE_ID}/Auto%20Deleted`)
    .reply(500, { error: 'Internal error' });

  const openaiResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: true,
    maxScores: { sexual: 0.95, violence: 0.92 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };
  const hiveResult: ModerationResult = {
    assetId,
    mode: 'thumbnails',
    isAudioOnly: false,
    thumbnailScores: [],
    exceedsThreshold: true,
    maxScores: { sexual: 0.96, violence: 0.88 },
    thresholds: { sexual: 0.9, violence: 0.9 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    openaiResult,
    hiveResult,
  });

  expect(didDelete).toBe(true);
  expect(scopeMux.isDone()).toBe(true);
  // Airtable error should be logged but not prevent deletion
});
