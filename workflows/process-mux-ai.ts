import Mux from '@mux/mux-node';
import { createHook, sleep } from 'workflow';
import type { ModerateJob, ModerateJobOutputs } from '@mux/mux-node/resources/robots/jobs/moderate';
import type { SummarizeJob, SummarizeJobOutputs } from '@mux/mux-node/resources/robots/jobs/summarize';
import type { AskQuestionsJob, AskQuestionsJobOutputs } from '@mux/mux-node/resources/robots/jobs/ask-questions';
import { sendSlackModerationResult, sendSlackSummarizationResult, sendSlackAutoDeleteMessage } from '../lib/slack-notifier';
import { checkAndAutoDelete, checkAndAutoDeleteWatchParty } from '../lib/moderation-action';
import type { ModerationHookPayload, SummarizeHookPayload, AskQuestionsHookPayload } from '../types';

const mux = new Mux();

const ROBOTS_JOB_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const MODERATION_THRESHOLDS = { sexual: 0.85, violence: 0.85 };
const MODERATION_MAX_SAMPLES = 5;

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

// --- Retrieve fallbacks (only used when the webhook was missed) ---

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

// --- Payload unwrappers ---

function unwrapModerationPayload(jobId: string, payload: ModerationHookPayload): ModerateJobOutputs {
  if (payload.status === 'completed') return payload.outputs;
  if (payload.status === 'errored') throw new Error(`Robots moderate job ${jobId} failed: ${payload.errorMessage}`);
  throw new Error(`Robots moderate job ${jobId} was cancelled`);
}

function unwrapSummarizePayload(jobId: string, payload: SummarizeHookPayload): SummarizeJobOutputs {
  if (payload.status === 'completed') return payload.outputs;
  if (payload.status === 'errored') throw new Error(`Robots summarize job ${jobId} failed: ${payload.errorMessage}`);
  throw new Error(`Robots summarize job ${jobId} was cancelled`);
}

function unwrapAskQuestionsPayload(jobId: string, payload: AskQuestionsHookPayload): AskQuestionsJobOutputs {
  if (payload.status === 'completed') return payload.outputs;
  if (payload.status === 'errored') throw new Error(`Robots ask-questions job ${jobId} failed: ${payload.errorMessage}`);
  throw new Error(`Robots ask-questions job ${jobId} was cancelled`);
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

  // 1. Moderation — create hook, fire job, wait on hook (with timeout fallback)
  //
  // The hook must be created BEFORE starting the job, otherwise the job could
  // complete and fire its webhook before the hook is registered, losing the payload.
  const moderationHook = createHook<ModerationHookPayload>({ token: moderationHookToken(assetId) });
  const moderationJobId = await startModerationJob(assetId);

  const moderationRaceResult = await Promise.race([
    moderationHook.then((payload) => ({ source: 'hook' as const, payload })),
    sleep(ROBOTS_JOB_TIMEOUT_MS).then(() => ({ source: 'timeout' as const })),
  ]);

  let moderationResult: ModerateJobOutputs;
  if (moderationRaceResult.source === 'hook') {
    moderationResult = unwrapModerationPayload(moderationJobId, moderationRaceResult.payload);
  } else {
    console.log(`Moderation hook timed out for job ${moderationJobId}, checking via API`); // eslint-disable-line no-console
    const job = await retrieveModerationJob(moderationJobId);
    if (job.status === 'completed' && job.outputs) {
      moderationResult = job.outputs;
    } else if (job.status === 'errored') {
      throw new Error(`Robots moderate job ${moderationJobId} failed: ${job.errors?.[0]?.message ?? 'Unknown error'}`);
    } else if (job.status === 'cancelled') {
      throw new Error(`Robots moderate job ${moderationJobId} was cancelled`);
    } else {
      throw new Error(`Robots moderate job ${moderationJobId} timed out (status: ${job.status})`);
    }
  }

  // 2. Handle moderation results + Slack notification
  await handleModerationAndNotify(assetId, moderationResult);

  // 3. If flagged, skip summarization
  if (moderationResult.exceeds_threshold) {
    console.log(`Asset ${assetId} flagged by moderation, skipping summarization`); // eslint-disable-line no-console
    return { assetId, moderationResult };
  }

  // 4. Summarize + ask-questions in parallel — each has its own hook, fired before its job.
  console.log(`Running summarization for asset ${assetId}`); // eslint-disable-line no-console

  const summarizeHook = createHook<SummarizeHookPayload>({ token: summarizeHookToken(assetId) });
  const askQuestionsHook = createHook<AskQuestionsHookPayload>({ token: askQuestionsHookToken(assetId) });

  const summarizeJobId = await startSummarizeJob(assetId);
  const questionsJobId = await startAskQuestionsJob(assetId, [
    { question: "Is this a professionally produced full length movie or TV show, or a standalone segment from it?" },
    { question: "Is this professionally produced footage of a cycling race?" },
    { question: WATCH_PARTY_QUESTION },
    { question: "Does this video use offensive language, and/or is likely to offend?" },
    { question: "Does this contain explicit slurs, dehumanization, or threats toward a protected group (not general insults or political opinions)?" },
    { question: "Is this video mostly of feet?" },
  ]);

  const summarizeRaceResult = await Promise.race([
    summarizeHook.then((payload) => ({ source: 'hook' as const, payload })),
    sleep(ROBOTS_JOB_TIMEOUT_MS).then(() => ({ source: 'timeout' as const })),
  ]);

  let summaryResult: SummarizeJobOutputs;
  if (summarizeRaceResult.source === 'hook') {
    summaryResult = unwrapSummarizePayload(summarizeJobId, summarizeRaceResult.payload);
  } else {
    console.log(`Summarize hook timed out for job ${summarizeJobId}, checking via API`); // eslint-disable-line no-console
    const job = await retrieveSummarizeJob(summarizeJobId);
    if (job.status === 'completed' && job.outputs) {
      summaryResult = job.outputs;
    } else if (job.status === 'errored') {
      throw new Error(`Robots summarize job ${summarizeJobId} failed: ${job.errors?.[0]?.message ?? 'Unknown error'}`);
    } else if (job.status === 'cancelled') {
      throw new Error(`Robots summarize job ${summarizeJobId} was cancelled`);
    } else {
      throw new Error(`Robots summarize job ${summarizeJobId} timed out (status: ${job.status})`);
    }
  }

  const questionsRaceResult = await Promise.race([
    askQuestionsHook.then((payload) => ({ source: 'hook' as const, payload })),
    sleep(ROBOTS_JOB_TIMEOUT_MS).then(() => ({ source: 'timeout' as const })),
  ]);

  let questionsResult: AskQuestionsJobOutputs;
  if (questionsRaceResult.source === 'hook') {
    questionsResult = unwrapAskQuestionsPayload(questionsJobId, questionsRaceResult.payload);
  } else {
    console.log(`Ask-questions hook timed out for job ${questionsJobId}, checking via API`); // eslint-disable-line no-console
    const job = await retrieveAskQuestionsJob(questionsJobId);
    if (job.status === 'completed' && job.outputs) {
      questionsResult = job.outputs;
    } else if (job.status === 'errored') {
      throw new Error(`Robots ask-questions job ${questionsJobId} failed: ${job.errors?.[0]?.message ?? 'Unknown error'}`);
    } else if (job.status === 'cancelled') {
      throw new Error(`Robots ask-questions job ${questionsJobId} was cancelled`);
    } else {
      throw new Error(`Robots ask-questions job ${questionsJobId} timed out (status: ${job.status})`);
    }
  }

  console.log('AI Summarization Result:', JSON.stringify(summaryResult, null, 2)); // eslint-disable-line no-console
  console.log('AI Ask Questions Result:', JSON.stringify(questionsResult, null, 2)); // eslint-disable-line no-console

  // 5. Check for watch party content and auto-delete if flagged
  const watchPartyDeleted = await handleWatchPartyModeration(assetId, questionsResult);

  if (!watchPartyDeleted) {
    await notifySlackSummarization(assetId, summaryResult, questionsResult);
  }

  return { assetId, moderationResult, summaryResult, questionsResult };
}
