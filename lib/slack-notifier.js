import got from 'got';
import { HOST_URL } from '../constants';

const slackWebhook = process.env.SLACK_WEBHOOK_ASSET_READY;
const moderatorPassword = process.env.SLACK_MODERATOR_PASSWORD;

const baseBlocks = ({ playbackId, assetId }) => ([
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
    type: 'image',
    title: {
      type: 'plain_text',
      text: 'Thumbnail',
      emoji: true,
    },
    image_url: `https://image.mux.com/${playbackId}/thumbnail.png?width=250`,
    alt_text: 'thumbnail',
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

export const sendSlackWebhook = async ({ playbackId, assetId }) => {
  if (!slackWebhook) {
    console.log('No slack webhook configured'); // eslint-disable-line no-console
    return Promise.resolve();
  }

  const blocks = baseBlocks({ playbackId, assetId });

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

  return got.post(slackWebhook, {
    json: {
      text: `New video created on stream.new. <${HOST_URL}/v/${playbackId}|View on stream.new>`,
      icon_emoji: 'see_no_evil',
      blocks,
    },
  });
};
