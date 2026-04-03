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

const MODERATION_THRESHOLDS = { sexual: 0.9, violence: 0.9 };
const MODERATION_MAX_SAMPLES = 5;

async function pollRobotsJob<T>(
  retrieve: (jobId: string) => Promise<{ status: string; outputs?: T; errors?: Array<{ message: string }> }>,
  jobId: string,
  workflowName: string,
): Promise<T> {
  for (let attempt = 0; attempt < ROBOTS_MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(ROBOTS_POLL_INTERVAL_MS);

    const job = await retrieve(jobId);

    if (job.status === 'completed' && job.outputs) {
      return job.outputs;
    }

    if (job.status === 'errored') {
      const errorMessage = job.errors?.[0]?.message || 'Unknown error';
      throw new Error(`Robots ${workflowName} job ${jobId} failed: ${errorMessage}`);
    }

    if (job.status === 'cancelled') {
      throw new Error(`Robots ${workflowName} job ${jobId} was cancelled`);
    }
  }

  throw new Error(`Robots ${workflowName} job ${jobId} timed out after ${ROBOTS_MAX_POLL_ATTEMPTS} attempts`);
}

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
  const { id: moderationJobId } = await mux.robots.jobs.moderate.create({
    parameters: {
      asset_id: assetId,
      thresholds: MODERATION_THRESHOLDS,
      max_samples: MODERATION_MAX_SAMPLES,
    },
  });

  const moderationResult = await pollRobotsJob<ModerateJobOutputs>(
    (id) => mux.robots.jobs.moderate.retrieve(id),
    moderationJobId,
    'moderate'
  );

  // 2. Handle moderation results + Slack notification
  await handleModerationAndNotify(assetId, moderationResult);

  // 3. If flagged, skip summarization
  if (moderationResult.exceeds_threshold) {
    console.log(`Asset ${assetId} flagged by moderation, skipping summarization`); // eslint-disable-line no-console
    return { assetId, moderationResult };
  }

  // 4. Start summarization + ask-questions jobs in parallel, poll for results
  console.log(`Running summarization for asset ${assetId}`); // eslint-disable-line no-console
  const { id: summaryJobId } = await mux.robots.jobs.summarize.create({
    parameters: { asset_id: assetId },
  });
  const { id: questionsJobId } = await mux.robots.jobs.askQuestions.create({
    parameters: {
      asset_id: assetId,
      questions: [
        { question: "Is this a professionally produced full length movie or TV show, or a standalone segment from it?" },
        { question: "Is this professionally produced footage of a cycling race?" },
        { question: WATCH_PARTY_QUESTION },
        { question: "Does this video use offensive language, and/or is likely to offend?" },
        { question: "Does this contain explicit slurs, dehumanization, or threats toward a protected group (not general insults or political opinions)?" },
        { question: "Is this video mostly of feet?" },
      ],
    },
  });

  // Poll sequentially to avoid interleaved steps that break workflow replay
  const summaryResult = await pollRobotsJob<SummarizeJobOutputs>(
    (id) => mux.robots.jobs.summarize.retrieve(id),
    summaryJobId,
    'summarize'
  );
  const questionsResult = await pollRobotsJob<AskQuestionsJobOutputs>(
    (id) => mux.robots.jobs.askQuestions.retrieve(id),
    questionsJobId,
    'ask-questions'
  );

  console.log('AI Summarization Result:', JSON.stringify(summaryResult, null, 2)); // eslint-disable-line no-console
  console.log('AI Ask Questions Result:', JSON.stringify(questionsResult, null, 2)); // eslint-disable-line no-console

  // 5. Check for watch party content and auto-delete if flagged
  const watchPartyDeleted = await handleWatchPartyModeration(assetId, questionsResult);

  if (!watchPartyDeleted) {
    await notifySlackSummarization(assetId, summaryResult, questionsResult);
  }

  return { assetId, moderationResult, summaryResult, questionsResult };
}
