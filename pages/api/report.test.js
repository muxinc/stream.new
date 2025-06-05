/**
 * @jest-environment node
 */
import handler from './report';

// Mock fetch
global.fetch = jest.fn();

describe('/api/report', () => {
  beforeEach(() => {
    process.env.SLACK_WEBHOOK_ASSET_READY = 'https://hooks.slack.com/test';
    fetch.mockClear();
  });

  afterEach(() => {
    delete process.env.SLACK_WEBHOOK_ASSET_READY;
  });

  describe('POST', () => {
    it('should send report to Slack webhook', async () => {
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const req = {
        method: 'POST',
        body: {
          playbackId: 'test-playback-id',
          reason: 'Inappropriate content',
          details: 'This video contains offensive material',
        },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(fetch).toHaveBeenCalledWith('https://hooks.slack.com/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Video reported',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Video Reported*\n*Playback ID:* test-playback-id\n*Reason:* Inappropriate content\n*Details:* This video contains offensive material\n*View:* https://stream.new/v/test-playback-id`,
              },
            },
          ],
        }),
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle missing Slack webhook URL', async () => {
      delete process.env.SLACK_WEBHOOK_ASSET_READY;

      const req = {
        method: 'POST',
        body: {
          playbackId: 'test-playback-id',
          reason: 'Test reason',
        },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(fetch).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle Slack webhook errors', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const req = {
        method: 'POST',
        body: {
          playbackId: 'test-playback-id',
          reason: 'Test reason',
        },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(fetch).toHaveBeenCalled();
      // Should still return 200 even if Slack fails
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle fetch errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const req = {
        method: 'POST',
        body: {
          playbackId: 'test-playback-id',
          reason: 'Test reason',
        },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error reporting video',
        error: 'Network error',
      });
    });
  });

  describe('Non-POST methods', () => {
    it('should return 405 for GET requests', async () => {
      const req = { method: 'GET' };
      const res = {
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await handler(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.end).toHaveBeenCalledWith('Method Not Allowed');
    });
  });
});