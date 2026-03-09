import { getSummaryAndTags, getModerationScores, askQuestions, SummaryAndTagsResult, ModerationResult, AskQuestionsResult } from '@mux/ai/workflows';
import Mux from '@mux/mux-node';
import { createHook, sleep } from 'workflow';
import { sendSlackModerationResult, sendSlackSummarizationResult, sendSlackAutoDeleteMessage } from '../lib/slack-notifier';
import { checkAndAutoDelete, checkAndAutoDeleteWatchParty } from '../lib/moderation-action';
import type { CaptionHookPayload, CaptionStatus } from '../types';

const mux = new Mux();

const CAPTION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function captionHookToken(assetId: string) {
  return `captions:${assetId}`;
}
const MODERATION_THRESHOLDS = { sexual: 0.9, violence: 0.9 };
const MODERATION_MAX_SAMPLES = 5;

async function handleModerationAndNotify(
  assetId: string,
  openaiResult: ModerationResult,
  hiveResult: ModerationResult
) {
  "use step";

  // Fetch asset data to get playbackId and duration
  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id;

  if (!playbackId) {
    throw new Error(`No playback ID found for asset ${assetId}. Cannot proceed with moderation notification.`);
  }

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
  const playbackId = asset.playback_ids?.[0]?.id;

  if (!playbackId) {
    throw new Error(`No playback ID found for asset ${assetId}. Cannot proceed with summarization notification.`);
  }

  await sendSlackSummarizationResult({
    playbackId,
    assetId,
    summaryResult,
    questionsResult,
  });
}

const WATCH_PARTY_QUESTION = "Is this a watchalong-style video where a person or small group is actively watching and reacting to a full-length movie or TV episode as the main focus of the clip?";
const WATCH_PARTY_CONFIDENCE_THRESHOLD = 0.8;

async function handleWatchPartyModeration(
  assetId: string,
  questionsResult: AskQuestionsResult
): Promise<boolean> {
  "use step";

  const watchPartyAnswer = questionsResult.answers.find(
    (qa) => qa.question === WATCH_PARTY_QUESTION
  );

  if (!watchPartyAnswer || watchPartyAnswer.answer !== 'yes' || watchPartyAnswer.confidence <= WATCH_PARTY_CONFIDENCE_THRESHOLD) {
    return false;
  }

  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id;

  if (!playbackId) {
    throw new Error(`No playback ID found for asset ${assetId}. Cannot proceed with watch party moderation.`);
  }

  const didAutoDelete = await checkAndAutoDeleteWatchParty({
    assetId,
    playbackId,
    answer: watchPartyAnswer.answer,
    confidence: watchPartyAnswer.confidence,
  });

  if (didAutoDelete) {
    const duration = asset.duration || 0;
    await sendSlackAutoDeleteMessage({
      assetId,
      duration,
      moderationDetails: `Flagged by: AI Question — "${WATCH_PARTY_QUESTION}" — Answer: ${watchPartyAnswer.answer}, Confidence: ${watchPartyAnswer.confidence.toFixed(3)} | Reasoning: ${watchPartyAnswer.reasoning}`,
    });
  }

  return didAutoDelete;
}

async function checkCaptionStatus(assetId: string): Promise<CaptionStatus> {
  "use step";

  const asset = await mux.video.assets.retrieve(assetId);
  const captionTrack = asset.tracks?.find(
    (t) => t.type === 'text' && t.text_type === 'subtitles' && t.text_source === 'generated_vod'
  );

  if (!captionTrack) {
    return { done: false, includeTranscript: false };
  }

  if (captionTrack.status === 'ready') {
    return { done: true, includeTranscript: true };
  }

  if (captionTrack.status === 'errored') {
    return { done: true, includeTranscript: false };
  }

  // Track exists but is still preparing
  return { done: false, includeTranscript: false };
}

export async function moderateAndSummarize(assetId: string) {
  "use workflow";

  console.log('Processing AI workflow for asset:', assetId); // eslint-disable-line no-console

  // 1. Run both OpenAI and Hive moderation concurrently
  const [openaiResult, hiveResult] = await Promise.all([
    getModerationScores(assetId, {
      provider: 'openai',
      thresholds: MODERATION_THRESHOLDS,
      maxSamples: MODERATION_MAX_SAMPLES,
    }),
    getModerationScores(assetId, {
      provider: 'hive',
      thresholds: MODERATION_THRESHOLDS,
      maxSamples: MODERATION_MAX_SAMPLES,
    }),
  ]);

  // 3. Handle moderation results + Slack notification
  await handleModerationAndNotify(assetId, openaiResult, hiveResult);

  // 4. If flagged, skip summarisation
  if (openaiResult.exceedsThreshold || hiveResult.exceedsThreshold) {
    console.log(`Asset ${assetId} flagged by moderation, skipping summarisation`); // eslint-disable-line no-console
    return { assetId, openaiResult, hiveResult, summarised: false };
  }

  // 5. Create hook before API check to avoid race between check and hook creation
  const captionHook = createHook<CaptionHookPayload>({ token: captionHookToken(assetId) });

  // 6. Check Mux API for caption track status (covers captions that arrived during moderation)
  let captionStatus = await checkCaptionStatus(assetId);
  let includeTranscript = captionStatus.includeTranscript;

  // 7. If captions not ready yet, wait for hook with timeout
  if (!captionStatus.done) {
    const result = await Promise.race([
      captionHook.then((payload: CaptionHookPayload) => ({ source: 'hook' as const, payload })),
      sleep(CAPTION_TIMEOUT_MS).then(() => ({ source: 'timeout' as const, payload: null })),
    ]);

    if (result.source === 'hook') {
      includeTranscript = result.payload.includeTranscript;
    } else {
      // Timeout — final Mux API check
      console.log(`Caption hook timed out for asset ${assetId}, checking Mux API`); // eslint-disable-line no-console
      captionStatus = await checkCaptionStatus(assetId);
      if (captionStatus.done) {
        includeTranscript = captionStatus.includeTranscript;
      } else {
        console.log(`Captions still not ready for asset ${assetId} after timeout, proceeding without transcript`); // eslint-disable-line no-console
        includeTranscript = false;
      }
    }
  }

  // 7. Run summarisation
  console.log(`Running summarisation for asset ${assetId} (includeTranscript: ${includeTranscript})`); // eslint-disable-line no-console

  const [summaryResult, questionsResult] = await Promise.all([
    getSummaryAndTags(assetId, {
      provider: 'openai',
      tone: 'neutral',
      includeTranscript,
      outputLanguageCode: 'en',
    }),
    askQuestions(assetId, [
      { question: "Is this a professionally produced full length movie or TV show, or a standalone segment from it?" },
      { question: "Is this professionally produced footage of a cycling race?" },
      { question: WATCH_PARTY_QUESTION },
      { question: "Does this video use offensive language, and/or is likely to offend?" },
      { question: "Does this contain explicit slurs, dehumanization, or threats toward a protected group (not general insults or political opinions)?" },
      { question: "Is this video mostly of feet?" },
    ], {
      provider: 'openai',
      includeTranscript,
    }),
  ]);

  console.log('AI Summary and Tags Result:', JSON.stringify(summaryResult, null, 2)); // eslint-disable-line no-console
  console.log('AI Questions Result:', JSON.stringify(questionsResult, null, 2)); // eslint-disable-line no-console

  // 8. Check for watch party content and auto-delete if flagged
  const watchPartyDeleted = await handleWatchPartyModeration(assetId, questionsResult);

  if (!watchPartyDeleted) {
    await notifySlackSummarization(assetId, summaryResult, questionsResult);
  }

  return {
    assetId,
    openaiResult,
    hiveResult,
    summarised: true,
    summaryResult,
    questionsResult,
  };
}
