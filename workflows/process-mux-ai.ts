import { getSummaryAndTags, getModerationScores, SummaryAndTagsResult, ModerationResult } from '@mux/ai/workflows';
import Mux from '@mux/mux-node';
import { sendSlackAssetReadyUsingMuxAI } from '../lib/slack-notifier';

const mux = new Mux();

async function notifySlack(
  assetId: string,
  summaryResult: SummaryAndTagsResult,
  moderationResult: ModerationResult
) {
  "use step";

  // Fetch asset data to get playbackId and duration
  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id || '';
  const duration = asset.duration || 0;

  await sendSlackAssetReadyUsingMuxAI({
    playbackId,
    assetId,
    duration,
    summaryResult,
    moderationResult,
  });
}

export async function processMuxAI(assetId: string) {
  "use workflow";

  console.log('Processing AI analysis for asset:', assetId); // eslint-disable-line no-console

  // Call both AI functions concurrently
  const [summaryResult, moderationResult] = await Promise.all([
    getSummaryAndTags(assetId, {
      provider: 'openai',
      tone: 'professional',
      includeTranscript: true,
    }),
    getModerationScores(assetId, {
      provider: 'openai',
    }),
  ]);

  console.log('AI Summary and Tags Result:', JSON.stringify(summaryResult, null, 2)); // eslint-disable-line no-console
  console.log('AI Moderation Scores Result:', JSON.stringify(moderationResult, null, 2)); // eslint-disable-line no-console

  // Send Slack notification
  await notifySlack(assetId, summaryResult, moderationResult);

  return {
    assetId,
    summaryResult,
    moderationResult,
  };
}
