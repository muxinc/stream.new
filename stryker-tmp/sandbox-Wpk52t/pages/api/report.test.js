/**
 * @jest-environment node
 */
// @ts-nocheck

import { createMocks } from 'node-mocks-http';
import handler from './report';

// Mock dependencies
jest.mock('../../lib/got-client', () => ({
  post: jest.fn(),
}));

jest.mock('../../lib/slack-notifier', () => ({
  sendAbuseReport: jest.fn(),
}));

describe('/api/report', () => {
  let gotClient;
  let slackNotifier;

  beforeEach(() => {
    gotClient = require('../../lib/got-client');
    slackNotifier = require('../../lib/slack-notifier');
    gotClient.post.mockClear();
    slackNotifier.sendAbuseReport.mockClear();
  });

  describe('POST', () => {
    it('should send report successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          playbackId: 'test-playback-id',
          reason: 'Inappropriate content',
          comment: 'This video contains offensive material',
        },
      });

      await handler(req, res);

      expect(slackNotifier.sendAbuseReport).toHaveBeenCalledWith({
        playbackId: 'test-playback-id',
        reason: 'Inappropriate content',
        comment: 'This video contains offensive material',
      });

      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({ message: 'thank you' });
    });

    it('should handle Slack notification errors gracefully', async () => {
      slackNotifier.sendAbuseReport.mockRejectedValue(new Error('Slack error'));

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          playbackId: 'test-playback-id',
          reason: 'Test reason',
        },
      });

      await handler(req, res);

      // Should still return success even if notification fails
      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({ message: 'thank you' });
    });
  });

  describe('Non-POST methods', () => {
    it('should return 405 for GET requests', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['POST']);
    });
  });
});