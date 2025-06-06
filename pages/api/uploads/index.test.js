/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http';
import handler from './index';

// Mock Mux SDK
jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    video: {
      uploads: {
        create: jest.fn().mockResolvedValue({
          id: 'test-upload-id',
          url: 'https://storage.googleapis.com/mux-uploads/test',
        }),
      },
    },
  })),
}));

const mockUpload = {
  id: 'test-upload-id',
  url: 'https://storage.googleapis.com/mux-uploads/test',
};

describe('/api/uploads', () => {

  describe('POST', () => {
    it('should create a new upload URL', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });

      await handler(req, res);

      // Note: We can't easily test the exact call with this mocking approach
      // but we can test the response structure

      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        id: mockUpload.id,
        url: mockUpload.url,
      });
    });

    // Note: Error testing would require more complex mocking setup
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

    it('should return 405 for PUT requests', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['POST']);
    });

    it('should return 405 for DELETE requests', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['POST']);
    });
  });
});