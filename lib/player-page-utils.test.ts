import { getPropsFromPlaybackId } from './player-page-utils';

// Mock dependencies
jest.mock('./image-dimensions', () => ({
  getImageDimensions: jest.fn(),
}));

jest.mock('@mux/blurup', () => ({
  createBlurUp: jest.fn(),
}));

jest.mock('./urlutils', () => ({
  getImageBaseUrl: jest.fn(() => 'https://image.mux.com'),
  getStreamBaseUrl: jest.fn(() => 'https://stream.mux.com'),
}));

jest.mock('../constants', () => ({
  HOST_URL: 'https://stream.new',
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('player-page-utils', () => {
  const { getImageDimensions } = require('./image-dimensions');
  const { createBlurUp } = require('@mux/blurup');

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error
    
    // Default successful responses
    mockFetch.mockResolvedValue({
      status: 200,
    });
    
    getImageDimensions.mockResolvedValue({
      aspectRatio: 16/9,
      width: 1920,
      height: 1080,
    });
    
    createBlurUp.mockResolvedValue({
      blurDataURL: 'data:image/jpeg;base64,test-blur-data',
    });
  });

  describe('getPropsFromPlaybackId', () => {
    it('returns correct props for valid playback ID', async () => {
      const result = await getPropsFromPlaybackId('test-playback-id');
      
      expect(result).toEqual({
        blurDataURL: 'data:image/jpeg;base64,test-blur-data',
        playbackId: 'test-playback-id',
        shareUrl: 'https://stream.new/v/test-playback-id',
        poster: 'https://image.mux.com/test-playback-id/thumbnail.jpg',
        videoExists: true,
        aspectRatio: 16/9,
      });
    });

    it('checks video existence with correct URL', async () => {
      await getPropsFromPlaybackId('test-playback-id');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://stream.mux.com/test-playback-id.m3u8'
      );
    });

    it('handles video not existing (404 response)', async () => {
      mockFetch.mockResolvedValue({ status: 404 });
      
      const result = await getPropsFromPlaybackId('test-playback-id');
      
      expect(result.videoExists).toBe(false);
    });

    it('handles video not existing (500 response)', async () => {
      mockFetch.mockResolvedValue({ status: 500 });
      
      const result = await getPropsFromPlaybackId('test-playback-id');
      
      expect(result.videoExists).toBe(false);
    });

    it('considers video existing for 2xx status codes', async () => {
      mockFetch.mockResolvedValue({ status: 201 });
      
      const result = await getPropsFromPlaybackId('test-playback-id');
      
      expect(result.videoExists).toBe(true);
    });

    it('considers video existing for 3xx status codes', async () => {
      mockFetch.mockResolvedValue({ status: 302 });
      
      const result = await getPropsFromPlaybackId('test-playback-id');
      
      expect(result.videoExists).toBe(true);
    });

    it('handles missing aspect ratio from image dimensions', async () => {
      getImageDimensions.mockResolvedValue({
        width: 1920,
        height: 1080,
        // aspectRatio missing
      });
      
      const result = await getPropsFromPlaybackId('test-playback-id');
      
      expect(result.aspectRatio).toBeUndefined();
    });

    it('handles null image dimensions', async () => {
      getImageDimensions.mockResolvedValue(null);
      
      const result = await getPropsFromPlaybackId('test-playback-id');
      
      expect(result.aspectRatio).toBeUndefined();
    });

    it('handles createBlurUp error gracefully', async () => {
      createBlurUp.mockRejectedValue(new Error('BlurUp service error'));
      
      const result = await getPropsFromPlaybackId('test-playback-id');
      
      expect(result.blurDataURL).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching blurup',
        expect.any(Error)
      );
    });

    it('handles network error for video check gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      // Should throw since the function doesn't catch this error
      await expect(getPropsFromPlaybackId('test-playback-id')).rejects.toThrow('Network error');
    });

    it('constructs correct poster URL', async () => {
      const result = await getPropsFromPlaybackId('my-video-id');
      
      expect(result.poster).toBe('https://image.mux.com/my-video-id/thumbnail.jpg');
    });

    it('constructs correct share URL', async () => {
      const result = await getPropsFromPlaybackId('my-video-id');
      
      expect(result.shareUrl).toBe('https://stream.new/v/my-video-id');
    });

    it('calls getImageDimensions with correct playback ID', async () => {
      await getPropsFromPlaybackId('test-playback-id');
      
      expect(getImageDimensions).toHaveBeenCalledWith('test-playback-id');
    });

    it('calls createBlurUp with correct parameters', async () => {
      await getPropsFromPlaybackId('test-playback-id');
      
      expect(createBlurUp).toHaveBeenCalledWith('test-playback-id', {});
    });

    it('handles edge case status codes correctly', async () => {
      // Test boundary conditions
      mockFetch.mockResolvedValue({ status: 199 });
      let result = await getPropsFromPlaybackId('test-playback-id');
      expect(result.videoExists).toBe(false);

      mockFetch.mockResolvedValue({ status: 200 });
      result = await getPropsFromPlaybackId('test-playback-id');
      expect(result.videoExists).toBe(true);

      mockFetch.mockResolvedValue({ status: 399 });
      result = await getPropsFromPlaybackId('test-playback-id');
      expect(result.videoExists).toBe(true);

      mockFetch.mockResolvedValue({ status: 400 });
      result = await getPropsFromPlaybackId('test-playback-id');
      expect(result.videoExists).toBe(false);
    });

    it('preserves playback ID in result', async () => {
      const playbackId = 'special-chars-123_test-video';
      const result = await getPropsFromPlaybackId(playbackId);
      
      expect(result.playbackId).toBe(playbackId);
    });
  });
});