import Mux from '@mux/mux-node';
import { defineHook, sleep } from 'workflow';
import type { ModerateJob, ModerateJobOutputs } from '@mux/mux-node/resources/robots/jobs/moderate';
import type { SummarizeJob, SummarizeJobOutputs } from '@mux/mux-node/resources/robots/jobs/summarize';
import type { AskQuestionsJob, AskQuestionsJobOutputs } from '@mux/mux-node/resources/robots/jobs/ask-questions';
import { sendSlackModerationResult, sendSlackSummarizationResult, sendSlackAutoDeleteMessage } from '../lib/slack-notifier';
import { checkAndAutoDelete, checkAndAutoDeleteWatchParty } from '../lib/moderation-action';
import type { RobotsJobHookPayload } from '../types';

const mux = new Mux();

const ROBOTS_JOB_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const MODERATION_THRESHOLDS = { sexual: 0.85, violence: 0.85 };
const MODERATION_MAX_SAMPLES = 5;

// --- Hook definitions (module-level, following the defineHook pattern) ---

export const moderationHook = defineHook<RobotsJobHookPayload>();
export const summarizeHook = defineHook<RobotsJobHookPayload>();
export const askQuestionsHook = defineHook<RobotsJobHookPayload>();

// --- Hook token helpers ---

export function moderationHookToken(assetId: string) {
  return `robots-moderate:${assetId}`;
}

export function summarizeHookToken(assetId: string) {
  return `robots-summarize:${assetId}`;
}

export function askQuestionsHookToken(assetId: string) {
  return `robots-ask-questions:${assetId}`;
}

// --- Job creation steps ---

async function startModerationJob(assetId: string): Promise<string> {
  "use step";
  const { id } = await mux.robots.jobs.moderate.create({
    parameters: { asset_id: assetId, thresholds: MODERATION_THRESHOLDS, max_samples: MODERATION_MAX_SAMPLES },
  });
  return id;
}

async function startSummarizeJob(assetId: string): Promise<string> {
  "use step";
  const { id } = await mux.robots.jobs.summarize.create({
    parameters: { asset_id: assetId },
  });
  return id;
}

async function startAskQuestionsJob(assetId: string, questions: Array<{ question: string }>): Promise<string> {
  "use step";
  const { id } = await mux.robots.jobs.askQuestions.create({
    parameters: { asset_id: assetId, questions },
  });
  return id;
}

// --- Job retrieve steps — called once per job to get authoritative outputs ---

async function retrieveModerationJob(jobId: string): Promise<ModerateJob> {
  "use step";
  return mux.robots.jobs.moderate.retrieve(jobId);
}

async function retrieveSummarizeJob(jobId: string): Promise<SummarizeJob> {
  "use step";
  return mux.robots.jobs.summarize.retrieve(jobId);
}

async function retrieveAskQuestionsJob(jobId: string): Promise<AskQuestionsJob> {
  "use step";
  return mux.robots.jobs.askQuestions.retrieve(jobId);
}

// --- Notification / moderation action steps ---

async function handleModerationAndNotify(
  assetId: string,
  moderationResult: ModerateJobOutputs
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
      moderationDetails: `Sexual: ${moderationResult.max_scores.sexual.toFixed(3)}, Violence: ${moderationResult.max_scores.violence.toFixed(3)}`,
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
  summaryResult: SummarizeJobOutputs,
  questionsResult: AskQuestionsJobOutputs
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
  questionsResult: AskQuestionsJobOutputs
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

export async function moderateAndSummarize(assetId: string) {
  "use workflow";

  console.log('Processing AI workflow for asset:', assetId); // eslint-disable-line no-console

  // 1. Moderation — create hook before firing the job, race against timeout.
  const modAction = moderationHook.create({ token: moderationHookToken(assetId) });
  const moderationJobId = await startModerationJob(assetId);

  const moderationOutcome = await Promise.race([
    sleep(ROBOTS_JOB_TIMEOUT_MS).then(() => ({ kind: 'timeout' as const })),
    modAction.then((payload) => ({ kind: 'hook' as const, payload })),
  ]);

  // Retrieve the job to get authoritative outputs (regardless of how we woke up).
  const moderationJob = await retrieveModerationJob(moderationJobId);
  if (moderationJob.status === 'errored') {
    throw new Error(`Robots moderate job ${moderationJobId} failed: ${moderationJob.errors?.[0]?.message ?? 'Unknown error'}`);
  }
  if (moderationJob.status === 'cancelled') {
    throw new Error(`Robots moderate job ${moderationJobId} was cancelled`);
  }
  if (moderationJob.status !== 'completed' || !moderationJob.outputs) {
    if (moderationOutcome.kind === 'timeout') {
      throw new Error(`Robots moderate job ${moderationJobId} timed out (status: ${moderationJob.status})`);
    }
    throw new Error(`Robots moderate job ${moderationJobId} did not complete (status: ${moderationJob.status})`);
  }
  const moderationResult = moderationJob.outputs;

  // 2. Handle moderation results + Slack notification.
  await handleModerationAndNotify(assetId, moderationResult);

  // 3. If flagged, skip summarization.
  if (moderationResult.exceeds_threshold) {
    console.log(`Asset ${assetId} flagged by moderation, skipping summarization`); // eslint-disable-line no-console
    return { assetId, moderationResult };
  }

  // 4. Summarize + ask-questions in parallel — each hook created before its job.
  console.log(`Running summarization for asset ${assetId}`); // eslint-disable-line no-console

  const sumAction = summarizeHook.create({ token: summarizeHookToken(assetId) });
  const aqAction = askQuestionsHook.create({ token: askQuestionsHookToken(assetId) });

  const summarizeJobId = await startSummarizeJob(assetId);
  const questionsJobId = await startAskQuestionsJob(assetId, [
    { question: "Is this a professionally produced full length movie or TV show, or a standalone segment from it?" },
    { question: "Is this professionally produced footage of a cycling race?" },
    { question: WATCH_PARTY_QUESTION },
    { question: "Does this video use offensive language, and/or is likely to offend?" },
    { question: "Does this contain explicit slurs, dehumanization, or threats toward a protected group (not general insults or political opinions)?" },
    { question: "Is this video mostly of feet?" },
  ]);

  // Summarize — race hook against timeout
  await Promise.race([
    sleep(ROBOTS_JOB_TIMEOUT_MS).then(() => ({ kind: 'timeout' as const })),
    sumAction.then((payload) => ({ kind: 'hook' as const, payload })),
  ]);

  const summarizeJob = await retrieveSummarizeJob(summarizeJobId);
  if (summarizeJob.status === 'errored') {
    throw new Error(`Robots summarize job ${summarizeJobId} failed: ${summarizeJob.errors?.[0]?.message ?? 'Unknown error'}`);
  }
  if (summarizeJob.status === 'cancelled') {
    throw new Error(`Robots summarize job ${summarizeJobId} was cancelled`);
  }
  if (summarizeJob.status !== 'completed' || !summarizeJob.outputs) {
    throw new Error(`Robots summarize job ${summarizeJobId} did not complete (status: ${summarizeJob.status})`);
  }
  const summaryResult = summarizeJob.outputs;

  // Ask-questions — race hook against timeout
  await Promise.race([
    sleep(ROBOTS_JOB_TIMEOUT_MS).then(() => ({ kind: 'timeout' as const })),
    aqAction.then((payload) => ({ kind: 'hook' as const, payload })),
  ]);

  const questionsJob = await retrieveAskQuestionsJob(questionsJobId);
  if (questionsJob.status === 'errored') {
    throw new Error(`Robots ask-questions job ${questionsJobId} failed: ${questionsJob.errors?.[0]?.message ?? 'Unknown error'}`);
  }
  if (questionsJob.status === 'cancelled') {
    throw new Error(`Robots ask-questions job ${questionsJobId} was cancelled`);
  }
  if (questionsJob.status !== 'completed' || !questionsJob.outputs) {
    throw new Error(`Robots ask-questions job ${questionsJobId} did not complete (status: ${questionsJob.status})`);
  }
  const questionsResult = questionsJob.outputs;

  console.log('AI Summarization Result:', JSON.stringify(summaryResult, null, 2)); // eslint-disable-line no-console
  console.log('AI Ask Questions Result:', JSON.stringify(questionsResult, null, 2)); // eslint-disable-line no-console

  // 5. Check for watch party content and auto-delete if flagged.
  const watchPartyDeleted = await handleWatchPartyModeration(assetId, questionsResult);

  if (!watchPartyDeleted) {
    await notifySlackSummarization(assetId, summaryResult, questionsResult);
  }

  return { assetId, moderationResult, summaryResult, questionsResult };
}
