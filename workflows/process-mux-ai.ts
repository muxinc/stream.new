import Mux from '@mux/mux-node';
import { sleep } from 'workflow';
import type { ModerateJobOutputs } from '@mux/mux-node/resources/robots/jobs/moderate';
import type { SummarizeJobOutputs } from '@mux/mux-node/resources/robots/jobs/summarize';
import type { AskQuestionsJobOutputs } from '@mux/mux-node/resources/robots/jobs/ask-questions';
import { sendSlackModerationResult, sendSlackSummarizationResult, sendSlackAutoDeleteMessage } from '../lib/slack-notifier';
import { checkAndAutoDelete, checkAndAutoDeleteWatchParty } from '../lib/moderation-action';

const mux = new Mux();

const ROBOTS_POLL_INTERVAL_MS = 5 * 1000; // 5 seconds
const ROBOTS_JOB_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const ROBOTS_MAX_POLL_ATTEMPTS = Math.ceil(ROBOTS_JOB_TIMEOUT_MS / ROBOTS_POLL_INTERVAL_MS); // ~120 attempts

const MODERATION_THRESHOLDS = { sexual: 0.85, violence: 0.85 };
const MODERATION_MAX_SAMPLES = 5;

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

// --- Job polling steps (return outputs when complete, null when still running) ---

async function pollModerationJob(jobId: string): Promise<ModerateJobOutputs | null> {
  "use step";
  const job = await mux.robots.jobs.moderate.retrieve(jobId);
  if (job.status === 'completed') return job.outputs ?? null;
  if (job.status === 'errored') throw new Error(`Robots moderate job ${jobId} failed: ${job.errors?.[0]?.message ?? 'Unknown error'}`);
  if (job.status === 'cancelled') throw new Error(`Robots moderate job ${jobId} was cancelled`);
  return null;
}

async function pollSummarizeJob(jobId: string): Promise<SummarizeJobOutputs | null> {
  "use step";
  const job = await mux.robots.jobs.summarize.retrieve(jobId);
  if (job.status === 'completed') return job.outputs ?? null;
  if (job.status === 'errored') throw new Error(`Robots summarize job ${jobId} failed: ${job.errors?.[0]?.message ?? 'Unknown error'}`);
  if (job.status === 'cancelled') throw new Error(`Robots summarize job ${jobId} was cancelled`);
  return null;
}

async function pollAskQuestionsJob(jobId: string): Promise<AskQuestionsJobOutputs | null> {
  "use step";
  const job = await mux.robots.jobs.askQuestions.retrieve(jobId);
  if (job.status === 'completed') return job.outputs ?? null;
  if (job.status === 'errored') throw new Error(`Robots ask-questions job ${jobId} failed: ${job.errors?.[0]?.message ?? 'Unknown error'}`);
  if (job.status === 'cancelled') throw new Error(`Robots ask-questions job ${jobId} was cancelled`);
  return null;
}

// --- Polling loop (runs in workflow context, calls step per attempt) ---

async function waitForModerationJob(jobId: string): Promise<ModerateJobOutputs> {
  for (let attempt = 0; attempt < ROBOTS_MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(ROBOTS_POLL_INTERVAL_MS);
    const result = await pollModerationJob(jobId);
    if (result) return result;
  }
  throw new Error(`Robots moderate job ${jobId} timed out after ${ROBOTS_MAX_POLL_ATTEMPTS} attempts`);
}

async function waitForSummarizeJob(jobId: string): Promise<SummarizeJobOutputs> {
  for (let attempt = 0; attempt < ROBOTS_MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(ROBOTS_POLL_INTERVAL_MS);
    const result = await pollSummarizeJob(jobId);
    if (result) return result;
  }
  throw new Error(`Robots summarize job ${jobId} timed out after ${ROBOTS_MAX_POLL_ATTEMPTS} attempts`);
}

async function waitForAskQuestionsJob(jobId: string): Promise<AskQuestionsJobOutputs> {
  for (let attempt = 0; attempt < ROBOTS_MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(ROBOTS_POLL_INTERVAL_MS);
    const result = await pollAskQuestionsJob(jobId);
    if (result) return result;
  }
  throw new Error(`Robots ask-questions job ${jobId} timed out after ${ROBOTS_MAX_POLL_ATTEMPTS} attempts`);
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

  // 1. Start moderation job and poll for result
  const moderationJobId = await startModerationJob(assetId);
  const moderationResult = await waitForModerationJob(moderationJobId);

  // 2. Handle moderation results + Slack notification
  await handleModerationAndNotify(assetId, moderationResult);

  // 3. If flagged, skip summarization
  if (moderationResult.exceeds_threshold) {
    console.log(`Asset ${assetId} flagged by moderation, skipping summarization`); // eslint-disable-line no-console
    return { assetId, moderationResult };
  }

  // 4. Start summarization + ask-questions jobs in parallel, poll for results
  console.log(`Running summarization for asset ${assetId}`); // eslint-disable-line no-console
  const summaryJobId = await startSummarizeJob(assetId);
  const questionsJobId = await startAskQuestionsJob(assetId, [
    { question: "Is this a professionally produced full length movie or TV show, or a standalone segment from it?" },
    { question: "Is this professionally produced footage of a cycling race?" },
    { question: WATCH_PARTY_QUESTION },
    { question: "Does this video use offensive language, and/or is likely to offend?" },
    { question: "Does this contain explicit slurs, dehumanization, or threats toward a protected group (not general insults or political opinions)?" },
    { question: "Is this video mostly of feet?" },
  ]);

  // Poll sequentially to avoid interleaved steps that break workflow replay
  const summaryResult = await waitForSummarizeJob(summaryJobId);
  const questionsResult = await waitForAskQuestionsJob(questionsJobId);

  console.log('AI Summarization Result:', JSON.stringify(summaryResult, null, 2)); // eslint-disable-line no-console
  console.log('AI Ask Questions Result:', JSON.stringify(questionsResult, null, 2)); // eslint-disable-line no-console

  // 5. Check for watch party content and auto-delete if flagged
  const watchPartyDeleted = await handleWatchPartyModeration(assetId, questionsResult);

  if (!watchPartyDeleted) {
    await notifySlackSummarization(assetId, summaryResult, questionsResult);
  }

  return { assetId, moderationResult, summaryResult, questionsResult };
}
