/**
 * @jest-environment node
 */

import { autoDelete } from './moderation-action';
import nock from 'nock';

beforeEach(() => {
  nock.disableNetConnect();
});

test('deletes the mux playback ID if adult >= 0.95', async () => {
  const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
  const assetId = 'asset-123';
  const playbackId = 'playback-123';
  const scopeMux = nock('https://api.mux.com/video/v1/').delete(`/assets/${assetId}/playback-ids/${playbackId}`).reply(204);
  const scopeAirtable = nock('https://api.airtable.com/v0').post(`/${process.env.AIRTABLE_BASE_ID}/Auto%20Deleted`).reply(200);

  const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });

  expect(isDeleted).toEqual(true);
  expect(scopeMux.isDone()).toEqual(true);
  expect(scopeAirtable.isDone()).toEqual(true);
});

test('returns false if no autoDelete happened', async () => {
  const hiveScores = { adult: 0.89, suggestive: 0.11, violent: 0.234 };
  const assetId = 'asset-123';
  const playbackId = 'playback-123';
  const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });

  expect(isDeleted).toEqual(false);
});
