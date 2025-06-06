/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http';
import handler from './mux';

// Mock buffer from micro
jest.mock('micro', () => ({
  buffer: jest.fn().mockResolvedValue(Buffer.from(JSON.stringify({
    type: 'video.asset.ready',
    data: {
      id: 'test-asset-id',
      playback_ids: [{ id: 'test-playback-id' }],
      duration: 120.5,
    },
  }))),
}));

// Mock Mux SDK
jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    webhooks: {
      verifySignature: jest.fn(),
    },
  })),
}));

// Mock moderation modules
jest.mock('../../../lib/moderation-google', () => ({
  getScores: jest.fn().mockResolvedValue({
    adult: 'VERY_UNLIKELY',
    violence: 'UNLIKELY',
    racy: 'POSSIBLE',
  }),
}));

jest.mock('../../../lib/moderation-hive', () => ({
  getScores: jest.fn().mockResolvedValue({
    scores: {
      general_nsfw: 0.1,
      general_suggestive: 0.2,
    },
    taskIds: ['task-1', 'task-2'],
  }),
}));

jest.mock('../../../lib/moderation-action', () => ({
  autoDelete: jest.fn().mockResolvedValue(false),
}));

jest.mock('../../../lib/slack-notifier', () => ({
  sendSlackAssetReady: jest.fn().mockResolvedValue(true),
  sendSlackAutoDeleteMessage: jest.fn().mockResolvedValue(true),
}));

describe('/api/webhooks/mux', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes video.asset.ready webhook', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'mux-signature': 'test-signature',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData.message).toContain('thanks Mux');
  });

  it('ignores non-asset.ready webhook types', async () => {
    const { buffer } = require('micro');
    buffer.mockResolvedValueOnce(Buffer.from(JSON.stringify({
      type: 'video.upload.created',
      data: { id: 'upload-id' },
    })));

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'mux-signature': 'test-signature',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData.message).toBe('thanks Mux');
  });

  it('skips signature verification when no secret configured', async () => {
    // Ensure no secret is configured 
    delete process.env.MUX_WEBHOOK_SIGNATURE_SECRET;
    
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'mux-signature': 'any-signature',
      },
    });

    await handler(req, res);

    // Should succeed and process normally when no secret configured
    expect(res._getStatusCode()).toBe(200);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData.message).toContain('thanks Mux');
  });

  it('handles auto-deletion scenario', async () => {
    const { autoDelete } = require('../../../lib/moderation-action');
    autoDelete.mockResolvedValueOnce(true);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'mux-signature': 'test-signature',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData.message).toContain('autodeleted');
  });

  it('handles processing errors', async () => {
    const { getScores } = require('../../../lib/moderation-google');
    getScores.mockRejectedValueOnce(new Error('Moderation service error'));

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'mux-signature': 'test-signature',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData.error).toBe('Error handling webhook');
  });

  it('returns 405 for non-POST methods', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader('Allow')).toEqual(['POST']);
  });

  it('handles missing playback IDs gracefully', async () => {
    const { buffer } = require('micro');
    buffer.mockResolvedValueOnce(Buffer.from(JSON.stringify({
      type: 'video.asset.ready',
      data: {
        id: 'test-asset-id',
        playback_ids: [],
        duration: 120.5,
      },
    })));

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'mux-signature': 'test-signature',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });
});