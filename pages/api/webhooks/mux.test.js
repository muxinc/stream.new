/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http';
import handler from './mux';
import { createMockMuxClient, mockWebhookEvent, mockAsset } from '../../../test/mocks/mux';
import { mockSlackPayload } from '../../../test/mocks/moderation';
import nock from 'nock';

// Mock dependencies
jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => createMockMuxClient()),
}));

jest.mock('../../../lib/slack-notifier', () => ({
  notifySlack: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../lib/moderation-google', () => ({
  moderateWithGoogleVisionAPI: jest.fn().mockResolvedValue({
    adult: 2,
    violence: 3,
    suggestive: 4,
  }),
}));

jest.mock('../../../lib/moderation-hive', () => ({
  moderateWithHiveAI: jest.fn().mockResolvedValue({
    adult: 0.8,
    suggestive: 0.6,
  }),
}));

jest.mock('../../../lib/moderation-action', () => ({
  checkModerationScores: jest.fn().mockReturnValue({ shouldDelete: false }),
}));

describe('/api/webhooks/mux', () => {
  let mockMuxClient;
  let notifySlack;
  let moderateWithGoogleVisionAPI;
  let moderateWithHiveAI;
  let checkModerationScores;

  beforeEach(() => {
    mockMuxClient = createMockMuxClient();
    require('@mux/mux-node').default.mockReturnValue(mockMuxClient);
    
    notifySlack = require('../../../lib/slack-notifier').notifySlack;
    moderateWithGoogleVisionAPI = require('../../../lib/moderation-google').moderateWithGoogleVisionAPI;
    moderateWithHiveAI = require('../../../lib/moderation-hive').moderateWithHiveAI;
    checkModerationScores = require('../../../lib/moderation-action').checkModerationScores;

    process.env.MUX_WEBHOOK_SIGNATURE_SECRET = 'test-webhook-secret';
    process.env.SLACK_WEBHOOK_ASSET_READY = 'https://hooks.slack.com/test';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'test-google-creds';
    process.env.HIVE_AI_KEY = 'test-hive-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
    delete process.env.MUX_WEBHOOK_SIGNATURE_SECRET;
    delete process.env.SLACK_WEBHOOK_ASSET_READY;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.HIVE_AI_KEY;
  });

  describe('POST', () => {
    it('should process video.asset.ready webhook successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'mux-signature': 't=1234567890,v1=test-signature',
          'content-type': 'application/json',
        },
        body: mockWebhookEvent,
      });

      await handler(req, res);

      expect(mockMuxClient.Webhooks.verifyHeader).toHaveBeenCalledWith(
        JSON.stringify(mockWebhookEvent),
        't=1234567890,v1=test-signature',
        'test-webhook-secret'
      );

      expect(notifySlack).toHaveBeenCalled();
      expect(moderateWithGoogleVisionAPI).toHaveBeenCalled();
      expect(moderateWithHiveAI).toHaveBeenCalled();
      expect(checkModerationScores).toHaveBeenCalled();

      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({ received: true });
    });

    it('should skip processing for non-ready webhook events', async () => {
      const nonReadyEvent = {
        ...mockWebhookEvent,
        type: 'video.asset.created',
      };

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'mux-signature': 't=1234567890,v1=test-signature',
          'content-type': 'application/json',
        },
        body: nonReadyEvent,
      });

      await handler(req, res);

      expect(notifySlack).not.toHaveBeenCalled();
      expect(moderateWithGoogleVisionAPI).not.toHaveBeenCalled();
      expect(moderateWithHiveAI).not.toHaveBeenCalled();

      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({ received: true });
    });

    it('should handle webhook without signature verification when secret not set', async () => {
      delete process.env.MUX_WEBHOOK_SIGNATURE_SECRET;

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: mockWebhookEvent,
      });

      await handler(req, res);

      expect(mockMuxClient.Webhooks.verifyHeader).not.toHaveBeenCalled();
      expect(notifySlack).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });

    it('should return 400 for invalid webhook signature', async () => {
      mockMuxClient.Webhooks.verifyHeader.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'mux-signature': 't=1234567890,v1=invalid-signature',
          'content-type': 'application/json',
        },
        body: mockWebhookEvent,
      });

      await handler(req, res);

      expect(notifySlack).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        message: 'Invalid signature',
        error: 'Invalid signature',
      });
    });

    it('should delete asset when moderation check fails', async () => {
      checkModerationScores.mockReturnValue({ shouldDelete: true });

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'mux-signature': 't=1234567890,v1=test-signature',
          'content-type': 'application/json',
        },
        body: mockWebhookEvent,
      });

      await handler(req, res);

      expect(checkModerationScores).toHaveBeenCalled();
      expect(mockMuxClient.Video.Assets.del).toHaveBeenCalledWith(mockAsset.id);
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle errors during asset deletion', async () => {
      checkModerationScores.mockReturnValue({ shouldDelete: true });
      mockMuxClient.Video.Assets.del.mockRejectedValue(new Error('Deletion failed'));

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'mux-signature': 't=1234567890,v1=test-signature',
          'content-type': 'application/json',
        },
        body: mockWebhookEvent,
      });

      await handler(req, res);

      expect(mockMuxClient.Video.Assets.del).toHaveBeenCalledWith(mockAsset.id);
      // Should still return 200 even if deletion fails
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle moderation errors gracefully', async () => {
      moderateWithGoogleVisionAPI.mockRejectedValue(new Error('Google API error'));
      moderateWithHiveAI.mockRejectedValue(new Error('Hive API error'));

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'mux-signature': 't=1234567890,v1=test-signature',
          'content-type': 'application/json',
        },
        body: mockWebhookEvent,
      });

      await handler(req, res);

      // Should still notify Slack even if moderation fails
      expect(notifySlack).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('Non-POST methods', () => {
    it('should return 405 for GET requests', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getHeaders()).toHaveProperty('allow', 'POST');
    });

    it('should return 405 for PUT requests', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getHeaders()).toHaveProperty('allow', 'POST');
    });
  });
});