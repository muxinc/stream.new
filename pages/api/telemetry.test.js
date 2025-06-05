/**
 * @jest-environment node
 */
import handler from './telemetry';

// Mock logger
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('/api/telemetry', () => {
  let logger;

  beforeEach(() => {
    process.env.TELEMETRY_ENDPOINT = 'https://telemetry.example.com/track';
    logger = require('../../lib/logger').logger;
    fetch.mockClear();
    logger.info.mockClear();
    logger.error.mockClear();
  });

  afterEach(() => {
    delete process.env.TELEMETRY_ENDPOINT;
  });

  describe('POST', () => {
    it('should forward telemetry data to endpoint', async () => {
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const telemetryData = {
        event: 'upload_complete',
        uploadId: 'test-upload-id',
        duration: 5000,
        fileSize: 1024 * 1024 * 10,
        success: true,
      };

      const req = {
        method: 'POST',
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '192.168.1.1',
        },
        body: telemetryData,
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(fetch).toHaveBeenCalledWith('https://telemetry.example.com/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
          'X-Forwarded-For': '192.168.1.1',
        },
        body: JSON.stringify(telemetryData),
      });

      expect(logger.info).toHaveBeenCalledWith('[Telemetry]', telemetryData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle missing telemetry endpoint', async () => {
      delete process.env.TELEMETRY_ENDPOINT;

      const req = {
        method: 'POST',
        headers: {},
        body: { event: 'test' },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(fetch).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('[Telemetry]', { event: 'test' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle telemetry endpoint errors', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const req = {
        method: 'POST',
        headers: {},
        body: { event: 'test' },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        '[Telemetry] Error forwarding to endpoint:',
        expect.any(Error)
      );
      // Should still return 200 to client
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle fetch errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const req = {
        method: 'POST',
        headers: {},
        body: { event: 'test' },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handler(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        '[Telemetry] Error forwarding to endpoint:',
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
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