/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http';
import handler from './[id]';
import { createMockMuxClient, mockAsset } from '../../../test/mocks/mux';

// Mock Mux SDK
jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => createMockMuxClient()),
}));

describe('/api/assets/[id]', () => {
  let mockMuxClient;

  beforeEach(() => {
    mockMuxClient = createMockMuxClient();
    require('@mux/mux-node').default.mockReturnValue(mockMuxClient);
    process.env.SLACK_MODERATOR_PASSWORD = 'test-password';
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      expect(mockMuxClient.Video.Assets.get).toHaveBeenCalledWith('test-asset-id');
      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual(mockAsset);
    });

    it('should handle errors when asset not found', async () => {
      mockMuxClient.Video.Assets.get.mockRejectedValue(new Error('Asset not found'));

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'invalid-asset-id',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        message: 'Error getting asset',
        error: 'Asset not found',
      });
    });
  });

  describe('DELETE', () => {
    it('should delete asset with correct password', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'test-asset-id',
        },
        body: {
          password: 'test-password',
        },
      });

      await handler(req, res);

      expect(mockMuxClient.Video.Assets.del).toHaveBeenCalledWith('test-asset-id');
      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({ message: 'Asset deleted' });
    });

    it('should reject deletion with incorrect password', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'test-asset-id',
        },
        body: {
          password: 'wrong-password',
        },
      });

      await handler(req, res);

      expect(mockMuxClient.Video.Assets.del).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        message: 'Unauthorized: Incorrect password',
      });
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

      expect(mockMuxClient.Video.Assets.del).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        message: 'Unauthorized: Incorrect password',
      });
    });

    it('should handle errors when deleting asset', async () => {
      mockMuxClient.Video.Assets.del.mockRejectedValue(new Error('Deletion failed'));

      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'test-asset-id',
        },
        body: {
          password: 'test-password',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        message: 'Error deleting asset',
        error: 'Deletion failed',
      });
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
      expect(res._getHeaders()).toHaveProperty('allow', 'GET, DELETE');
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
      expect(res._getHeaders()).toHaveProperty('allow', 'GET, DELETE');
    });
  });
});