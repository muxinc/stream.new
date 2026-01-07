import { getSummaryAndTags, getModerationScores, SummaryAndTagsResult, ModerationResult } from '@mux/ai/workflows';
import Mux from '@mux/mux-node';
import { sendSlackModerationResult, sendSlackSummarizationResult } from '../lib/slack-notifier';

const mux = new Mux();

async function notifySlackModeration(
  assetId: string,
  moderationResult: ModerationResult
) {
  "use step";

  // Fetch asset data to get playbackId and duration
  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id || '';
  const duration = asset.duration || 0;

  await sendSlackModerationResult({
    playbackId,
    assetId,
    duration,
    moderationResult,
  });
}

async function notifySlackSummarization(
  assetId: string,
  summaryResult: SummaryAndTagsResult
) {
  "use step";

  // Fetch asset data to get playbackId
  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id || '';

  await sendSlackSummarizationResult({
    playbackId,
    assetId,
    summaryResult,
  });
}

export async function processModerationOnly(assetId: string) {
  "use workflow";

  console.log('Processing moderation for asset:', assetId); // eslint-disable-line no-console

  const moderationResult = await getModerationScores(assetId, {
    provider: 'openai',
  });

  console.log('AI Moderation Scores Result:', JSON.stringify(moderationResult, null, 2)); // eslint-disable-line no-console

  // Send Slack notification
  await notifySlackModeration(assetId, moderationResult);

  return {
    assetId,
    moderationResult,
  };
}

export async function processSummaryOnly(assetId: string) {
  "use workflow";

  console.log('Processing summary for asset:', assetId); // eslint-disable-line no-console

  const summaryResult = await getSummaryAndTags(assetId, {
    provider: 'openai',
    tone: 'professional',
    includeTranscript: true,
  });

  console.log('AI Summary and Tags Result:', JSON.stringify(summaryResult, null, 2)); // eslint-disable-line no-console

  // Send Slack notification
  await notifySlackSummarization(assetId, summaryResult);

  return {
    assetId,
    summaryResult,
  };
}
