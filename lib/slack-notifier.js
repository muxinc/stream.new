import got from 'got';
import { HOST_URL } from '../constants';

const slackWebhook = process.env.SLACK_WEBHOOK_ASSET_READY;
const moderatorPassword = process.env.SLACK_MODERATOR_PASSWORD;

const baseBlocks = ({ playbackId, assetId }) => ((
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
      text: 'I Need a Marg',
      emoji: true,
    },
    image_url: `https://image.mux.com/${playbackId}/thumbnail.png`,
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
          url: `https://stream.new/v/${playbackId}`,
        },
        style: 'primary',
        value: 'click_me_123',
      },
    ],
  }));

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
          text: 'DELETE (cannot be undone)',
          emoji: true,
          url: `${HOST_URL}/api/moderator/delete-asset?id=O26q2RkvXHNE2sLZhcCSv37MpVCWGjeA&slack-moderator-password=eea8608a9a6cc916c602798d9d3f28e89475b8d1f428d4e09e07c9ed6524291d8cee8286acb308ab430c728a17c124aaa70d5794a35952efe423bbd856e61b7f`,
        },
        value: 'click_me_123',
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
