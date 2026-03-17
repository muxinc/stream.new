import Mux from '@mux/mux-node';
import { createHook, sleep, fetch as workflowFetch } from 'workflow';
import { sendSlackModerationResult, sendSlackSummarizationResult, sendSlackAutoDeleteMessage } from '../lib/slack-notifier';
import { checkAndAutoDelete, checkAndAutoDeleteWatchParty } from '../lib/moderation-action';
import { createModerationJob, createSummarizeJob, createAskQuestionsJob, getJobStatus } from '../lib/robots-client';
import type { RobotsModerationOutputs, RobotsSummaryOutputs, RobotsAskQuestionsOutputs, RobotsModerationWebhookOutputs, RobotsSummaryWebhookOutputs, RobotsAskQuestionsWebhookOutputs } from '../types/robots';
import type { CaptionHookPayload, CaptionStatus } from '../types';

const mux = new Mux();

const CAPTION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ROBOTS_POLL_INTERVAL_MS = 5 * 1000; // 5 seconds
const ROBOTS_JOB_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function captionHookToken(assetId: string) {
  return `captions:${assetId}`;
}

const MODERATION_THRESHOLDS = { sexual: 0.9, violence: 0.9 };
const MODERATION_MAX_SAMPLES = 5;

function normalizeModerationOutputs(outputs: Record<string, unknown>): RobotsModerationOutputs {
  const raw = outputs as unknown as RobotsModerationWebhookOutputs;
  return {
    maxScores: raw.max_scores,
    exceedsThreshold: raw.exceeds_threshold,
  };
}

function normalizeSummaryOutputs(outputs: Record<string, unknown>): RobotsSummaryOutputs {
  const raw = outputs as unknown as RobotsSummaryWebhookOutputs;
  return {
    title: raw.title,
    description: raw.description,
    tags: raw.tags,
  };
}

function normalizeAskQuestionsOutputs(outputs: Record<string, unknown>): RobotsAskQuestionsOutputs {
  const raw = outputs as unknown as RobotsAskQuestionsWebhookOutputs;
  return {
    answers: raw.answers,
  };
}

const ROBOTS_MAX_POLL_ATTEMPTS = Math.ceil(ROBOTS_JOB_TIMEOUT_MS / ROBOTS_POLL_INTERVAL_MS); // ~120 attempts

async function pollRobotsJob<T>(
  workflow: string,
  jobId: string,
  normalizeOutputs: (outputs: Record<string, unknown>) => T,
): Promise<T> {
  for (let attempt = 0; attempt < ROBOTS_MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(ROBOTS_POLL_INTERVAL_MS);

    const status = await getJobStatus(workflowFetch, workflow, jobId);

    if (status.status === 'completed' && status.outputs) {
      return normalizeOutputs(status.outputs);
    }

    if (status.status === 'errored') {
      const errorMessage = status.errors?.[0]?.message || 'Unknown error';
      throw new Error(`Robots ${workflow} job ${jobId} failed: ${errorMessage}`);
    }

    if (status.status === 'cancelled') {
      throw new Error(`Robots ${workflow} job ${jobId} was cancelled`);
    }
  }

  throw new Error(`Robots ${workflow} job ${jobId} timed out after ${ROBOTS_MAX_POLL_ATTEMPTS} attempts`);
}

async function handleModerationAndNotify(
  assetId: string,
  moderationResult: RobotsModerationOutputs
) {
  "use step";

  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id;

  if (!playbackId) {
    throw new Error(`No playback ID found for asset ${assetId}. Cannot proceed with moderation notification.`);
  }

  const duration = asset.duration || 0;

  const didAutoDelete = await checkAndAutoDelete({
    assetId,
    playbackId,
    moderationResult,
  });

  if (didAutoDelete) {
    await sendSlackAutoDeleteMessage({
      assetId,
      duration,
      moderationDetails: `Sexual: ${moderationResult.maxScores.sexual.toFixed(3)}, Violence: ${moderationResult.maxScores.violence.toFixed(3)}`,
    });
  } else {
    await sendSlackModerationResult({
      playbackId,
      assetId,
      duration,
      moderationResult,
    });
  }
}

async function notifySlackSummarization(
  assetId: string,
  summaryResult: RobotsSummaryOutputs,
  questionsResult: RobotsAskQuestionsOutputs
) {
  "use step";

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
  questionsResult: RobotsAskQuestionsOutputs
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

  // 1. Start moderation job and poll for result
  const { jobId: moderationJobId } = await createModerationJob(workflowFetch, assetId, {
    thresholds: MODERATION_THRESHOLDS,
    maxSamples: MODERATION_MAX_SAMPLES,
  });

  const moderationResult = await pollRobotsJob<RobotsModerationOutputs>(
    'moderate', moderationJobId, normalizeModerationOutputs
  );

  // 2. Handle moderation results + Slack notification
  await handleModerationAndNotify(assetId, moderationResult);

  // 3. If flagged, skip summarisation
  if (moderationResult.exceedsThreshold) {
    console.log(`Asset ${assetId} flagged by moderation, skipping summarisation`); // eslint-disable-line no-console
    return { assetId, moderationResult, summarised: false };
  }

  // 4. Create caption hook before API check to avoid race
  const captionHook = createHook<CaptionHookPayload>({ token: captionHookToken(assetId) });

  // 5. Check Mux API for caption track status (covers captions that arrived during moderation)
  let captionStatus = await checkCaptionStatus(assetId);
  let includeTranscript = captionStatus.includeTranscript;

  // 6. If captions not ready yet, wait for hook with timeout
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

  // 7. Start summarisation + ask-questions jobs in parallel, poll for results
  console.log(`Running summarisation for asset ${assetId} (includeTranscript: ${includeTranscript})`); // eslint-disable-line no-console

  // Start both jobs (they run in parallel on Robots API)
  const { jobId: summaryJobId } = await createSummarizeJob(workflowFetch, assetId, { tone: 'neutral' });
  const { jobId: questionsJobId } = await createAskQuestionsJob(workflowFetch, assetId, [
    { question: "Is this a professionally produced full length movie or TV show, or a standalone segment from it?" },
    { question: "Is this professionally produced footage of a cycling race?" },
    { question: WATCH_PARTY_QUESTION },
    { question: "Does this video use offensive language, and/or is likely to offend?" },
    { question: "Does this contain explicit slurs, dehumanization, or threats toward a protected group (not general insults or political opinions)?" },
    { question: "Is this video mostly of feet?" },
  ]);

  // Poll sequentially to avoid interleaved steps that break workflow replay
  const summaryResult = await pollRobotsJob<RobotsSummaryOutputs>('summarize', summaryJobId, normalizeSummaryOutputs);
  const questionsResult = await pollRobotsJob<RobotsAskQuestionsOutputs>('ask-questions', questionsJobId, normalizeAskQuestionsOutputs);

  console.log('AI Summary and Tags Result:', JSON.stringify(summaryResult, null, 2)); // eslint-disable-line no-console
  console.log('AI Questions Result:', JSON.stringify(questionsResult, null, 2)); // eslint-disable-line no-console

  // 8. Check for watch party content and auto-delete if flagged
  const watchPartyDeleted = await handleWatchPartyModeration(assetId, questionsResult);

  if (!watchPartyDeleted) {
    await notifySlackSummarization(assetId, summaryResult, questionsResult);
  }

  return {
    assetId,
    moderationResult,
    summarised: true,
    summaryResult,
    questionsResult,
  };
}
