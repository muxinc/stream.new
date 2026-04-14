/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { sendSlackModerationResult } from './slack-notifier';
import type { ModerateJobOutputs } from '@mux/mux-node/resources/robots/jobs/moderate';
import nock from 'nock';

test('it sends a moderation result request to the slack webhook', async () => {
  const scope = nock(process.env.SLACK_WEBHOOK_ASSET_READY!).post('/').reply(200, 'test response');

  const mockModerationResult: ModerateJobOutputs = {
    max_scores: { sexual: 0.1, violence: 0.2 },
    exceeds_threshold: false,
    thumbnail_scores: [],
  };

  await sendSlackModerationResult({
    playbackId: '1234',
    assetId: '4556',
    duration: 600,
    moderationResult: mockModerationResult,
  });
  expect(scope.isDone()).toEqual(true);
});
