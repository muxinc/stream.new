/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { sendSlackAssetReady } from './slack-notifier';
import nock from 'nock';

test('it sends a request to the slack webhook', async () => {
  const scope = nock(process.env.SLACK_WEBHOOK_ASSET_READY!).post('/').reply(200, 'test response');

  await sendSlackAssetReady({ playbackId: '1234', assetId: '4556', duration: 600 });
  expect(scope.isDone()).toEqual(true);
});
