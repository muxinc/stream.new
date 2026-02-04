import got from './got-client';
import { HOST_URL } from '../constants';
import { getImageBaseUrl } from './urlutils';
import type { SummaryAndTagsResult, ModerationResult, AskQuestionsResult } from '@mux/ai/workflows';

const slackWebhook = process.env.SLACK_WEBHOOK_ASSET_READY;
const moderatorPassword = process.env.SLACK_MODERATOR_PASSWORD;

type BlockItem = {
  type: string,
  title?: {
    type: string,
    text: string,
    emoji: boolean,
  }
  image_url?: string,
  alt_text?: string,
  text?: {
    type: string,
    text: string,
  },
  fields?: Array<{
    type: string,
    text: string,
  }>,
  accessory?: {
    type: string,
    text: {
      type: string,
      text: string,
    },
    url: string,
    style: string
  },
  elements?: [{
    type: string,
    text: {
      type: string,
      emoji: boolean,
      text: string
    },
    style: string,
    url: string,
  }]
};

const baseBlocks = ({ playbackId, assetId, duration }: {playbackId: string, assetId: string, duration: number}): BlockItem[] => ([
  {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `*Asset ID:*\n${assetId}`,
      },
      {
        type: 'mrkdwn',
        text: `*Playback ID:*\n${playbackId}`,
      },
      {
        type: 'mrkdwn',
        text: `*Duration:*\n${Math.round(duration)} seconds`,
      },
    ],
  },
  {
    type: 'image',
    title: {
      type: 'plain_text',
      text: 'Thumbnail',
      emoji: true,
    },
    image_url: `${getImageBaseUrl()}/${playbackId}/storyboard.png`,
    alt_text: 'storyboard',
  },
  {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          emoji: true,
          text: 'View on stream.new',
        },
        style: 'primary',
        url: `${HOST_URL}/v/${playbackId}`,
      },
    ],
  }]);

export const sendSlackModerationResult = async ({
  playbackId,
  assetId,
  duration,
  openaiResult,
  hiveResult
}: {
  playbackId: string;
  assetId: string;
  duration: number;
  openaiResult: ModerationResult;
  hiveResult: ModerationResult;
}): Promise<null> => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return null;
  }

  const blocks: BlockItem[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'New video on stream.new!',
      },
    },
  ];

  blocks.push(...baseBlocks({ playbackId, assetId, duration }));

  // Add OpenAI moderation scores to the fields (blocks[1] is the first baseBlocks item)
  if (openaiResult?.maxScores && blocks[1].fields) {
    const { sexual, violence } = openaiResult.maxScores;
    const exceedsThreshold = openaiResult.exceedsThreshold;
    const emoji = exceedsThreshold ? '🚨' : '✅';

    blocks[1].fields.push({
      type: 'mrkdwn',
      text: `*Moderation (OpenAI):*\nSexual: ${sexual.toFixed(3)}, Violence: ${violence.toFixed(3)} ${emoji}`,
    });
  }

  // Add Hive moderation scores to the fields
  if (hiveResult?.maxScores && blocks[1].fields) {
    const { sexual, violence } = hiveResult.maxScores;
    const exceedsThreshold = hiveResult.exceedsThreshold;
    const emoji = exceedsThreshold ? '🚨' : '✅';

    blocks[1].fields.push({
      type: 'mrkdwn',
      text: `*Moderation (Hive):*\nSexual: ${sexual.toFixed(3)}, Violence: ${violence.toFixed(3)} ${emoji}`,
    });
  }

  // Always include delete button
  if (moderatorPassword) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'If this is bad, it can be deleted with 1 click:',
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'DELETE',
        },
        url: `${HOST_URL}/moderator/delete-asset?asset_id=${assetId}&slack_moderator_password=${moderatorPassword}`,
        style: 'danger',
      },
    });
  }

  await got.post(slackWebhook, {
    json: {
      text: `Moderation complete for video on stream.new. <${HOST_URL}/v/${playbackId}|View on stream.new>`,
      icon_emoji: 'robot_face',
      blocks,
    },
  });
  return null;
};

export const sendSlackSummarizationResult = async ({
  playbackId,
  assetId,
  summaryResult,
  questionsResult
}: {
  playbackId: string;
  assetId: string;
  summaryResult: SummaryAndTagsResult;
  questionsResult: AskQuestionsResult;
}): Promise<null> => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return null;
  }

  const blocks: BlockItem[] = [];

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: 'AI summary complete for video on stream.new!',
    },
  });

  // Add title if available
  if (summaryResult?.title) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Title:*\n${summaryResult.title}`,
      }
    });
  }

  // Add description if available
  if (summaryResult?.description) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Description:*\n${summaryResult.description}`,
      }
    });
  }

  // Add question answers if available
  if (questionsResult?.answers && questionsResult.answers.length > 0) {
    blocks.push({
      type: 'section',
      fields: questionsResult.answers.map(qa => {
        const emoji = qa.answer === 'yes' ? ' 🚨' : '';
        return {
          type: 'mrkdwn',
          text: `*${qa.question}${emoji}*\n${qa.answer}`,
        };
      }),
    });
  }

  // Add view button
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          emoji: true,
          text: 'View on stream.new',
        },
        style: 'primary',
        url: `${HOST_URL}/v/${playbackId}`,
      },
    ],
  });

  // Always include delete button
  if (moderatorPassword) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'If this is bad, it can be deleted with 1 click:',
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'DELETE',
        },
        url: `${HOST_URL}/moderator/delete-asset?asset_id=${assetId}&slack_moderator_password=${moderatorPassword}`,
        style: 'danger',
      },
    });
  }

  await got.post(slackWebhook, {
    json: {
      text: `AI summary complete for video on stream.new!. <${HOST_URL}/v/${playbackId}|View on stream.new>`,
      icon_emoji: 'mag',
      blocks,
    },
  });
  return null;
};

export const sendSlackAutoDeleteMessage = async ({ assetId, duration, moderationDetails }: { assetId: string, duration: number, moderationDetails: string }): Promise<null> => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return null;
  }

  await got.post(slackWebhook, {
    json: {
      text: `Auto-deleted by moderator: ${assetId} duration: ${duration}. ${moderationDetails}`,
      icon_emoji: 'female-police-officer',
    },
  });

  return null;
};

export const sendAbuseReport = async ({ playbackId, reason, comment }: {playbackId: string, reason: string, comment?: string}): Promise<null> => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return null;
  }

  await got.post(slackWebhook, {
    json: {
      text: `Reported for abuse: ${reason}. ${comment}. ${playbackId} <${HOST_URL}/v/${playbackId}|View on stream.new>`,
      icon_emoji: 'rotating_light',
    },
  });
  return null;
};
