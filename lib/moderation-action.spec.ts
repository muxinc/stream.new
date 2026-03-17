/**
 * @jest-environment node
 */
import nock from 'nock';
import { checkAndAutoDelete, checkAndAutoDeleteWatchParty } from './moderation-action';
import type { RobotsModerationOutputs } from '../types/robots';

const assetId = 'test-asset-123';
const playbackId = 'test-playback-456';

beforeEach(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
  delete process.env.AUTO_DELETE_ENABLED;
});

test('returns false when AUTO_DELETE_ENABLED is not set, even if moderation exceeds', async () => {
  const moderationResult: RobotsModerationOutputs = {
    exceedsThreshold: true,
    maxScores: { sexual: 0.95, violence: 0.92 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    moderationResult,
  });

  expect(didDelete).toBe(false);
});

test('deletes and records when AUTO_DELETE_ENABLED=1 and moderation exceeds', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const scopeMux = nock('https://api.mux.com')
    .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
    .reply(204);

  const scopeAirtable = nock('https://api.airtable.com')
    .post(`/v0/${process.env.AIRTABLE_BASE_ID}/Auto%20Deleted`)
    .reply(200, { records: [] });

  const moderationResult: RobotsModerationOutputs = {
    exceedsThreshold: true,
    maxScores: { sexual: 0.95, violence: 0.92 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    moderationResult,
  });

  expect(didDelete).toBe(true);
  expect(scopeMux.isDone()).toBe(true);
  expect(scopeAirtable.isDone()).toBe(true);
});

test('does not delete when moderation does not exceed threshold', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const moderationResult: RobotsModerationOutputs = {
    exceedsThreshold: false,
    maxScores: { sexual: 0.40, violence: 0.25 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    moderationResult,
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

  const moderationResult: RobotsModerationOutputs = {
    exceedsThreshold: true,
    maxScores: { sexual: 0.95, violence: 0.92 },
  };

  const didDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    moderationResult,
  });

  expect(didDelete).toBe(true);
  expect(scopeMux.isDone()).toBe(true);
  expect(scopeAirtable.isDone()).toBe(true);
  // Airtable error should be logged but not prevent deletion
});

// Watch party moderation tests

test('watch party: deletes when answer is yes and confidence > 0.8', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const scopeMux = nock('https://api.mux.com')
    .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
    .reply(204);

  const scopeAirtable = nock('https://api.airtable.com')
    .post(`/v0/${process.env.AIRTABLE_BASE_ID}/Auto%20Deleted`)
    .reply(200, { records: [] });

  const didDelete = await checkAndAutoDeleteWatchParty({
    assetId,
    playbackId,
    answer: 'yes',
    confidence: 0.85,
  });

  expect(didDelete).toBe(true);
  expect(scopeMux.isDone()).toBe(true);
  expect(scopeAirtable.isDone()).toBe(true);
});

test('watch party: does not delete when confidence is exactly 0.8', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const didDelete = await checkAndAutoDeleteWatchParty({
    assetId,
    playbackId,
    answer: 'yes',
    confidence: 0.8,
  });

  expect(didDelete).toBe(false);
});

test('watch party: does not delete when confidence <= 0.8', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const didDelete = await checkAndAutoDeleteWatchParty({
    assetId,
    playbackId,
    answer: 'yes',
    confidence: 0.75,
  });

  expect(didDelete).toBe(false);
});

test('watch party: does not delete when answer is no', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const didDelete = await checkAndAutoDeleteWatchParty({
    assetId,
    playbackId,
    answer: 'no',
    confidence: 0.95,
  });

  expect(didDelete).toBe(false);
});

test('watch party: does not delete when AUTO_DELETE_ENABLED is not set', async () => {
  const didDelete = await checkAndAutoDeleteWatchParty({
    assetId,
    playbackId,
    answer: 'yes',
    confidence: 0.95,
  });

  expect(didDelete).toBe(false);
});

test('watch party: still returns true if Airtable recording fails', async () => {
  process.env.AUTO_DELETE_ENABLED = '1';

  const scopeMux = nock('https://api.mux.com')
    .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
    .reply(204);

  const scopeAirtable = nock('https://api.airtable.com')
    .post(`/v0/${process.env.AIRTABLE_BASE_ID}/Auto%20Deleted`)
    .reply(500, { error: 'Internal error' });

  const didDelete = await checkAndAutoDeleteWatchParty({
    assetId,
    playbackId,
    answer: 'yes',
    confidence: 0.9,
  });

  expect(didDelete).toBe(true);
  expect(scopeMux.isDone()).toBe(true);
  expect(scopeAirtable.isDone()).toBe(true);
});
