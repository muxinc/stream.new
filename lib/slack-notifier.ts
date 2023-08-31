import got from './got-client';
import { HOST_URL } from '../constants';
import { ModerationScores } from '../types';
import { getImageBaseUrl } from './urlutils';

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
    text: {
      type: 'mrkdwn',
      text: 'New video created on stream.new',
    },
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Asset ID:*\n ${assetId}`,
    },
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Playback ID:*\n ${playbackId}`,
    },
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Duration:*\n ${Math.floor(duration)} seconds`,
    },
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

export const sendSlackAssetReady = async ({ playbackId, assetId, duration, googleScores, hiveScores, hiveTaskIds }: {playbackId: string, assetId: string, duration: number, googleScores?: ModerationScores, hiveScores?: ModerationScores, hiveTaskIds?: string[] }): Promise<null> => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return null;
  }

  const blocks = baseBlocks({ playbackId, assetId, duration });

  if (googleScores) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Moderation scores (Google) | score is 1-5:*\n ${JSON.stringify(googleScores)}`,
      }
    });
  }

  if (hiveScores) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Moderation scores (Hive) | score is 0-1:*\n ${JSON.stringify(hiveScores)}`,
      }
    });
  }

  if (hiveTaskIds) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Hive task IDs:*\n ${JSON.stringify(hiveTaskIds)}`,
      }
    });
  }

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
      text: `New video created on stream.new. <${HOST_URL}/v/${playbackId}|View on stream.new>`,
      icon_emoji: 'see_no_evil',
      blocks,
    },
  });
  return null;
};

export const sendSlackAutoDeleteMessage = async ({ assetId, duration, hiveScores, hiveTaskIds }: { assetId: string, duration: number, hiveScores?: ModerationScores, hiveTaskIds?: string[] }): Promise<null> => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return null;
  }

  await got.post(slackWebhook, {
    json: {
      text: `Auto-deleted by moderator: ${assetId} duration: ${duration}. ${JSON.stringify(hiveScores)}. Task IDs: ${JSON.stringify(hiveTaskIds)}`,
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
