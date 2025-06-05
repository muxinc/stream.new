/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http';
import handler from './[id]';
import { createMockMuxClient, mockUpload, mockAsset } from '../../../test/mocks/mux';

// Mock Mux SDK
jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => createMockMuxClient()),
}));

describe('/api/uploads/[id]', () => {
  let mockMuxClient;

  beforeEach(() => {
    mockMuxClient = createMockMuxClient();
    require('@mux/mux-node').default.mockReturnValue(mockMuxClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return upload status when upload exists', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'test-upload-id',
        },
      });

      await handler(req, res);

      expect(mockMuxClient.Video.Uploads.get).toHaveBeenCalledWith('test-upload-id');
      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toHaveProperty('upload', mockUpload);
    });

    it('should include asset data when asset_id is present', async () => {
      const uploadWithAsset = { ...mockUpload, asset_id: 'test-asset-id' };
      mockMuxClient.Video.Uploads.get.mockResolvedValue({ data: uploadWithAsset });

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'test-upload-id',
        },
      });

      await handler(req, res);

      expect(mockMuxClient.Video.Uploads.get).toHaveBeenCalledWith('test-upload-id');
      expect(mockMuxClient.Video.Assets.get).toHaveBeenCalledWith('test-asset-id');
      
      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toHaveProperty('upload', uploadWithAsset);
      expect(jsonData).toHaveProperty('asset', mockAsset);
    });

    it('should handle errors when fetching upload', async () => {
      mockMuxClient.Video.Uploads.get.mockRejectedValue(new Error('Upload not found'));

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'invalid-upload-id',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        message: 'Error getting upload',
        error: 'Upload not found',
      });
    });

    it('should handle errors when fetching asset', async () => {
      const uploadWithAsset = { ...mockUpload, asset_id: 'test-asset-id' };
      mockMuxClient.Video.Uploads.get.mockResolvedValue({ data: uploadWithAsset });
      mockMuxClient.Video.Assets.get.mockRejectedValue(new Error('Asset not found'));

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'test-upload-id',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData.message).toBe('Error getting upload');
    });
  });

  describe('PUT', () => {
    it('should cancel an upload', async () => {
      const cancelledUpload = { ...mockUpload, status: 'cancelled' };
      mockMuxClient.Video.Uploads.cancel.mockResolvedValue({ data: cancelledUpload });

      const { req, res } = createMocks({
        method: 'PUT',
        query: {
          id: 'test-upload-id',
        },
      });

      await handler(req, res);

      expect(mockMuxClient.Video.Uploads.cancel).toHaveBeenCalledWith('test-upload-id');
      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual(cancelledUpload);
    });

    it('should handle errors when cancelling upload', async () => {
      mockMuxClient.Video.Uploads.cancel.mockRejectedValue(new Error('Cannot cancel upload'));

      const { req, res } = createMocks({
        method: 'PUT',
        query: {
          id: 'test-upload-id',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData).toEqual({
        message: 'Error cancelling upload',
        error: 'Cannot cancel upload',
      });
    });
  });

  describe('Non-supported methods', () => {
    it('should return 405 for POST requests', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          id: 'test-upload-id',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getHeaders()).toHaveProperty('allow', 'GET, PUT');
    });

    it('should return 405 for DELETE requests', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'test-upload-id',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getHeaders()).toHaveProperty('allow', 'GET, PUT');
    });
  });
});