import { getSummaryAndTags, getModerationScores, askQuestions, SummaryAndTagsResult, ModerationResult, AskQuestionsResult } from '@mux/ai/workflows';
import Mux from '@mux/mux-node';
import { sendSlackModerationResult, sendSlackSummarizationResult, sendSlackAutoDeleteMessage } from '../lib/slack-notifier';
import { checkAndAutoDelete } from '../lib/moderation-action';

const mux = new Mux();

async function handleModerationAndNotify(
  assetId: string,
  openaiResult: ModerationResult,
  hiveResult: ModerationResult
) {
  "use step";

  // Fetch asset data to get playbackId and duration
  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id || '';
  const duration = asset.duration || 0;

  // Check if we should auto-delete (if either service flags it)
  const didAutoDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    openaiResult,
    hiveResult,
  });

  // Send appropriate Slack message
  if (didAutoDelete) {
    const flaggedBy = [];
    if (openaiResult.exceedsThreshold) flaggedBy.push('OpenAI');
    if (hiveResult.exceedsThreshold) flaggedBy.push('Hive');

    await sendSlackAutoDeleteMessage({
      assetId,
      duration,
      moderationDetails: `OpenAI - Sexual: ${openaiResult.maxScores.sexual.toFixed(3)}, Violence: ${openaiResult.maxScores.violence.toFixed(3)} | Hive - Sexual: ${hiveResult.maxScores.sexual.toFixed(3)}, Violence: ${hiveResult.maxScores.violence.toFixed(3)} | Flagged by: ${flaggedBy.join(', ')}`,
    });
  } else {
    await sendSlackModerationResult({
      playbackId,
      assetId,
      duration,
      openaiResult,
      hiveResult,
    });
  }
}

async function notifySlackSummarization(
  assetId: string,
  summaryResult: SummaryAndTagsResult,
  questionsResult: AskQuestionsResult
) {
  "use step";

  // Fetch asset data to get playbackId
  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id || '';

  await sendSlackSummarizationResult({
    playbackId,
    assetId,
    summaryResult,
    questionsResult,
  });
}

export async function processModerationOnly(assetId: string) {
  "use workflow";

  console.log('Processing moderation for asset:', assetId); // eslint-disable-line no-console

  // Run both OpenAI and Hive moderation concurrently
  const [openaiResult, hiveResult] = await Promise.all([
    getModerationScores(assetId, {
      provider: 'openai',
    }),
    getModerationScores(assetId, {
      provider: 'hive',
    }),
  ]);

  // Handle auto-delete and send Slack notification
  await handleModerationAndNotify(assetId, openaiResult, hiveResult);

  return {
    assetId,
    openaiResult,
    hiveResult,
  };
}

export async function processSummaryOnly(assetId: string) {
  "use workflow";

  console.log('Processing summary for asset:', assetId); // eslint-disable-line no-console

  // Run summary and questions concurrently
  const [summaryResult, questionsResult] = await Promise.all([
    getSummaryAndTags(assetId, {
      provider: 'openai',
      tone: 'neutral',
      includeTranscript: true,
    }),
    askQuestions(assetId, [
      { question: "Is this a professionally produced full length movie or TV show, or a standalone segment from it?" },
      { question: "Is this professionally produced footage of a cycling race?" },
      { question: "Is this footage of one or a small group of people watching a full length movie or TV show?" },
      { question: "Does this video use offensive language, and/or is likely to offend?" },
      { question: "Is this hate speech?" },
      { question: "Is this video mostly of feet?" },
    ], {
      provider: 'openai',
      includeTranscript: true,
    }),
  ]);

  console.log('AI Summary and Tags Result:', JSON.stringify(summaryResult, null, 2)); // eslint-disable-line no-console
  console.log('AI Questions Result:', JSON.stringify(questionsResult, null, 2)); // eslint-disable-line no-console

  // Send Slack notification
  await notifySlackSummarization(assetId, summaryResult, questionsResult);

  return {
    assetId,
    summaryResult,
    questionsResult,
  };
}
