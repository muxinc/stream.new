/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http';
import handler from './[id]';

// Mock Mux SDK
jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    video: {
      uploads: {
        retrieve: jest.fn().mockResolvedValue({
          id: 'test-upload-id',
          status: 'waiting',
          url: 'https://storage.googleapis.com/mux-uploads/test',
          asset_id: null,
        }),
      },
    },
  })),
}));

const mockUpload = {
  id: 'test-upload-id',
  status: 'waiting',
  url: 'https://storage.googleapis.com/mux-uploads/test',
  asset_id: null,
};

describe('/api/uploads/[id]', () => {

  describe('GET', () => {
    it('should return upload status when upload exists', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'test-upload-id',
        },
      });

      await handler(req, res);

      // Test response structure rather than mock calls
      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        upload: {
          status: 'waiting',
          url: 'https://storage.googleapis.com/mux-uploads/test',
          asset_id: null,
        },
      });
    });

    // Note: Error cases would require more complex mocking
  });

  describe('Non-GET methods', () => {
    it('should return 405 for POST requests', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          id: 'test-upload-id',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['GET']);
    });
  });
});