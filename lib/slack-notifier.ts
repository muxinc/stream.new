import { HOST_URL } from '../constants';
import { getImageBaseUrl } from './urlutils';
import type { RobotsModerationOutputs, RobotsSummaryOutputs, RobotsAskQuestionsOutputs } from '../types/robots';

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

const deleteButtonBlock = (assetId: string): BlockItem => ({
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

export const sendSlackModerationResult = async ({
  playbackId,
  assetId,
  duration,
  moderationResult,
}: {
  playbackId: string;
  assetId: string;
  duration: number;
  moderationResult: RobotsModerationOutputs;
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

  if (moderationResult?.maxScores && blocks[1].fields) {
    const { sexual, violence } = moderationResult.maxScores;
    const emoji = moderationResult.exceedsThreshold ? '🚨' : '✅';

    blocks[1].fields.push({
      type: 'mrkdwn',
      text: `*Moderation:*\nSexual: ${sexual.toFixed(3)}, Violence: ${violence.toFixed(3)} ${emoji}`,
    });
  }

  // Always include delete button
  if (moderatorPassword) {
    blocks.push(deleteButtonBlock(assetId));
  }

  const res = await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `Moderation complete for video on stream.new! <${HOST_URL}/v/${playbackId}|View on stream.new>`,
      icon_emoji: 'robot_face',
      blocks,
    }),
  });
  if (!res.ok) {
    console.error('Slack webhook error', res.status, await res.text()); // eslint-disable-line no-console
  }
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
  summaryResult: RobotsSummaryOutputs;
  questionsResult: RobotsAskQuestionsOutputs;
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
    blocks.push(deleteButtonBlock(assetId));
  }

  const res = await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `AI summary complete for video on stream.new! <${HOST_URL}/v/${playbackId}|View on stream.new>`,
      icon_emoji: 'mag',
      blocks,
    }),
  });
  if (!res.ok) {
    console.error('Slack webhook error', res.status, await res.text()); // eslint-disable-line no-console
  }
  return null;
};

export const sendSlackAutoDeleteMessage = async ({ assetId, duration, moderationDetails }: { assetId: string, duration: number, moderationDetails: string }): Promise<null> => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return null;
  }

  const res = await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `Auto-deleted by moderator: ${assetId} duration: ${duration}. ${moderationDetails}`,
      icon_emoji: 'female-police-officer',
    }),
  });
  if (!res.ok) {
    console.error('Slack webhook error', res.status, await res.text()); // eslint-disable-line no-console
  }

  return null;
};

export const sendAbuseReport = async ({ playbackId, reason, comment }: {playbackId: string, reason: string, comment?: string}): Promise<null> => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return null;
  }

  const res = await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `Reported for abuse: ${reason}. ${comment}. ${playbackId} <${HOST_URL}/v/${playbackId}|View on stream.new>`,
      icon_emoji: 'rotating_light',
    }),
  });
  if (!res.ok) {
    console.error('Slack webhook error', res.status, await res.text()); // eslint-disable-line no-console
  }
  return null;
};
