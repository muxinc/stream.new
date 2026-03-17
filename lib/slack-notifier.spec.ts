/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { sendSlackModerationResult } from './slack-notifier';
import type { RobotsModerationOutputs } from '../types/robots';
import nock from 'nock';

test('it sends a moderation result request to the slack webhook', async () => {
  const scope = nock(process.env.SLACK_WEBHOOK_ASSET_READY!).post('/').reply(200, 'test response');

  const mockModerationResult: RobotsModerationOutputs = {
    maxScores: { sexual: 0.1, violence: 0.2 },
    exceedsThreshold: false,
  };

  await sendSlackModerationResult({
    playbackId: '1234',
    assetId: '4556',
    duration: 600,
    moderationResult: mockModerationResult,
  });
  expect(scope.isDone()).toEqual(true);
});
