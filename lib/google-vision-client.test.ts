/**
 * @jest-environment node
 */
import { GoogleVisionClient } from './google-vision-client';
import { mockGoogleVisionResponse, mockGoogleVisionMultipleResponses } from '../test/mocks/moderation';

// Mock Google Cloud Vision
jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
    safeSearchDetection: jest.fn(),
    batchAnnotateImages: jest.fn(),
  })),
}));

describe('GoogleVisionClient', () => {
  let client;
  let mockAnnotatorClient;

  beforeEach(() => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'test-credentials';
    const ImageAnnotatorClient = require('@google-cloud/vision').ImageAnnotatorClient;
    mockAnnotatorClient = new ImageAnnotatorClient();
    client = new GoogleVisionClient();
    client.client = mockAnnotatorClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  });

  describe('analyzeImage', () => {
    it('should analyze a single image URL', async () => {
      mockAnnotatorClient.safeSearchDetection.mockResolvedValue([
        mockGoogleVisionResponse.responses[0],
      ]);

      const result = await client.analyzeImage('https://example.com/image.jpg');

      expect(mockAnnotatorClient.safeSearchDetection).toHaveBeenCalledWith({
        image: { source: { imageUri: 'https://example.com/image.jpg' } },
      });

      expect(result).toEqual(mockGoogleVisionResponse.responses[0].safeSearchAnnotation);
    });

    it('should handle analysis errors', async () => {
      mockAnnotatorClient.safeSearchDetection.mockRejectedValue(
        new Error('Vision API error')
      );

      await expect(
        client.analyzeImage('https://example.com/image.jpg')
      ).rejects.toThrow('Vision API error');
    });

    it('should handle empty response', async () => {
      mockAnnotatorClient.safeSearchDetection.mockResolvedValue([{}]);

      const result = await client.analyzeImage('https://example.com/image.jpg');
      expect(result).toBeUndefined();
    });
  });

  describe('analyzeImages', () => {
    it('should analyze multiple images in batch', async () => {
      mockAnnotatorClient.batchAnnotateImages.mockResolvedValue([
        mockGoogleVisionMultipleResponses,
      ]);

      const imageUrls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];

      const result = await client.analyzeImages(imageUrls);

      expect(mockAnnotatorClient.batchAnnotateImages).toHaveBeenCalledWith({
        requests: imageUrls.map(url => ({
          image: { source: { imageUri: url } },
          features: [{ type: 'SAFE_SEARCH_DETECTION' }],
        })),
      });

      expect(result).toEqual(
        mockGoogleVisionMultipleResponses.responses.map(r => r.safeSearchAnnotation)
      );
    });

    it('should handle batch analysis errors', async () => {
      mockAnnotatorClient.batchAnnotateImages.mockRejectedValue(
        new Error('Batch API error')
      );

      await expect(
        client.analyzeImages(['https://example.com/image.jpg'])
      ).rejects.toThrow('Batch API error');
    });

    it('should handle empty image array', async () => {
      const result = await client.analyzeImages([]);
      expect(result).toEqual([]);
      expect(mockAnnotatorClient.batchAnnotateImages).not.toHaveBeenCalled();
    });

    it('should filter out invalid responses', async () => {
      mockAnnotatorClient.batchAnnotateImages.mockResolvedValue([
        {
          responses: [
            { safeSearchAnnotation: { adult: 'UNLIKELY' } },
            {}, // Empty response
            { safeSearchAnnotation: { adult: 'LIKELY' } },
          ],
        },
      ]);

      const result = await client.analyzeImages([
        'url1',
        'url2',
        'url3',
      ]);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ adult: 'UNLIKELY' });
      expect(result[1]).toEqual({ adult: 'LIKELY' });
    });
  });

  describe('initialization', () => {
    it('should not initialize client without credentials', () => {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const clientWithoutCreds = new GoogleVisionClient();
      expect(clientWithoutCreds.client).toBeNull();
    });

    it('should initialize client with credentials', () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = 'test-creds';
      const clientWithCreds = new GoogleVisionClient();
      expect(clientWithCreds.client).toBeDefined();
    });
  });

  describe('isEnabled', () => {
    it('should return true when client is initialized', () => {
      expect(client.isEnabled()).toBe(true);
    });

    it('should return false when client is not initialized', () => {
      client.client = null;
      expect(client.isEnabled()).toBe(false);
    });
  });
});