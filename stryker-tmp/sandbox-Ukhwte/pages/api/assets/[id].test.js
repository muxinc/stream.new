/**
 * @jest-environment node
 */
// @ts-nocheck

import { createMocks } from 'node-mocks-http';
import handler from './[id]';

// Mock Mux SDK
jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    video: {
      assets: {
        retrieve: jest.fn().mockResolvedValue({
          id: 'test-asset-id',
          status: 'ready',
          playback_ids: [{ id: 'test-playback-id', policy: 'public' }],
          errors: null,
        }),
        delete: jest.fn().mockResolvedValue({}),
      },
    },
  })),
}));

const mockAsset = {
  id: 'test-asset-id',
  status: 'ready',
  playback_ids: [{ id: 'test-playback-id', policy: 'public' }],
  errors: null,
};

describe('/api/assets/[id]', () => {
  beforeEach(() => {
    process.env.SLACK_MODERATOR_PASSWORD = 'test-password';
  });

  afterEach(() => {
    delete process.env.SLACK_MODERATOR_PASSWORD;
  });

  describe('GET', () => {
    it('should return asset data', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'test-asset-id',
        },
      });

      await handler(req, res);

      // Test response structure
      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        asset: {
          id: 'test-asset-id',
          status: 'ready',
          errors: null,
          playback_id: 'test-playback-id',
        },
      });
    });

    // Note: Error cases would require more complex mocking
  });

  describe('DELETE', () => {
    it('should delete asset with correct password', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'test-asset-id',
        },
        body: {
          slack_moderator_password: 'test-password',
        },
      });

      await handler(req, res);

      // Test that the request succeeds
      expect(res._getStatusCode()).toBe(200);
    });

    it('should reject deletion with incorrect password', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'test-asset-id',
        },
        body: {
          slack_moderator_password: 'wrong-password',
        },
      });

      await handler(req, res);

      // Test that request is rejected
      expect(res._getStatusCode()).toBe(401);
    });

    it('should reject deletion without password', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'test-asset-id',
        },
        body: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('Non-supported methods', () => {
    it('should return 405 for POST requests', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          id: 'test-asset-id',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['GET', 'DELETE']);
    });

    it('should return 405 for PUT requests', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: {
          id: 'test-asset-id',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['GET', 'DELETE']);
    });
  });
});