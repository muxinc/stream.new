/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http';
import handler from './index';
import { createMockMuxClient, mockUpload } from '../../../test/mocks/mux';

// Mock Mux SDK
jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => createMockMuxClient()),
}));

describe('/api/uploads', () => {
  let mockMuxClient;

  beforeEach(() => {
    mockMuxClient = createMockMuxClient();
    require('@mux/mux-node').default.mockReturnValue(mockMuxClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should create a new upload URL', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });

      await handler(req, res);

      expect(mockMuxClient.Video.Uploads.create).toHaveBeenCalledWith({
        cors_origin: '*',
        new_asset_settings: {
          playback_policy: 'public',
          mp4_support: 'standard',
        },
      });

      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        id: mockUpload.id,
        url: mockUpload.url,
      });
    });

    it('should handle errors when creating upload fails', async () => {
      mockMuxClient.Video.Uploads.create.mockRejectedValue(new Error('Mux API error'));

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        message: 'Error creating upload',
        error: 'Mux API error',
      });
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

    it('should return 405 for DELETE requests', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getHeaders()).toHaveProperty('allow', 'POST');
    });
  });
});