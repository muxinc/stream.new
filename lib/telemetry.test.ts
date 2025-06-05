import { trackEvent, trackUploadProgress, trackPlayerEvent } from './telemetry';

// Mock fetch
global.fetch = jest.fn();

describe('telemetry', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe('trackEvent', () => {
    it('should send event to telemetry endpoint', async () => {
      await trackEvent('test_event', { userId: '123', action: 'click' });

      expect(fetch).toHaveBeenCalledWith('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'test_event',
          data: { userId: '123', action: 'click' },
          timestamp: expect.any(Number),
        }),
      });
    });

    it('should include browser information', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 Test Browser',
        writable: true,
      });

      await trackEvent('browser_test');

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.data).toHaveProperty('userAgent', 'Mozilla/5.0 Test Browser');
    });

    it('should handle telemetry errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(trackEvent('error_test')).resolves.not.toThrow();
    });

    it('should add timestamp to all events', async () => {
      const beforeTime = Date.now();
      await trackEvent('timestamp_test');
      const afterTime = Date.now();

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(callArgs.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('trackUploadProgress', () => {
    it('should track upload start', async () => {
      await trackUploadProgress('upload-123', 'start', {
        fileSize: 1024 * 1024 * 10,
        fileType: 'video/mp4',
      });

      expect(fetch).toHaveBeenCalledWith('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'upload_progress',
          data: {
            uploadId: 'upload-123',
            stage: 'start',
            fileSize: 1024 * 1024 * 10,
            fileType: 'video/mp4',
          },
          timestamp: expect.any(Number),
        }),
      });
    });

    it('should track upload progress updates', async () => {
      await trackUploadProgress('upload-123', 'progress', {
        percent: 50,
        bytesUploaded: 1024 * 1024 * 5,
      });

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.data).toMatchObject({
        uploadId: 'upload-123',
        stage: 'progress',
        percent: 50,
        bytesUploaded: 1024 * 1024 * 5,
      });
    });

    it('should track upload completion', async () => {
      await trackUploadProgress('upload-123', 'complete', {
        duration: 30000,
        averageSpeed: 1024 * 1024, // 1MB/s
      });

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.data).toMatchObject({
        uploadId: 'upload-123',
        stage: 'complete',
        duration: 30000,
        averageSpeed: 1024 * 1024,
      });
    });

    it('should track upload errors', async () => {
      await trackUploadProgress('upload-123', 'error', {
        error: 'Connection timeout',
        bytesUploaded: 1024 * 512,
      });

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.data).toMatchObject({
        uploadId: 'upload-123',
        stage: 'error',
        error: 'Connection timeout',
        bytesUploaded: 1024 * 512,
      });
    });
  });

  describe('trackPlayerEvent', () => {
    it('should track player initialization', async () => {
      await trackPlayerEvent('player_init', {
        playbackId: 'playback-123',
        playerType: 'mux',
      });

      expect(fetch).toHaveBeenCalledWith('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'player_init',
          data: {
            playbackId: 'playback-123',
            playerType: 'mux',
          },
          timestamp: expect.any(Number),
        }),
      });
    });

    it('should track playback events', async () => {
      await trackPlayerEvent('play', {
        playbackId: 'playback-123',
        currentTime: 0,
      });

      await trackPlayerEvent('pause', {
        playbackId: 'playback-123',
        currentTime: 30.5,
      });

      await trackPlayerEvent('ended', {
        playbackId: 'playback-123',
        duration: 120,
      });

      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should track quality changes', async () => {
      await trackPlayerEvent('quality_change', {
        playbackId: 'playback-123',
        from: '720p',
        to: '1080p',
        currentTime: 45,
      });

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.event).toBe('quality_change');
      expect(callArgs.data).toMatchObject({
        from: '720p',
        to: '1080p',
      });
    });

    it('should track errors', async () => {
      await trackPlayerEvent('error', {
        playbackId: 'playback-123',
        errorCode: 'MEDIA_ERR_NETWORK',
        errorMessage: 'Network error',
        currentTime: 15,
      });

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.data).toMatchObject({
        errorCode: 'MEDIA_ERR_NETWORK',
        errorMessage: 'Network error',
      });
    });
  });

  describe('batch tracking', () => {
    it('should handle multiple events in quick succession', async () => {
      const promises = [
        trackEvent('event1'),
        trackEvent('event2'),
        trackEvent('event3'),
      ];

      await Promise.all(promises);

      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('data sanitization', () => {
    it('should handle undefined data gracefully', async () => {
      await trackEvent('test', undefined);

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.data).toEqual({});
    });

    it('should handle null data gracefully', async () => {
      await trackEvent('test', null);

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.data).toEqual({});
    });

    it('should preserve falsy values in data', async () => {
      await trackEvent('test', {
        zero: 0,
        empty: '',
        bool: false,
      });

      const callArgs = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callArgs.data).toEqual({
        zero: 0,
        empty: '',
        bool: false,
      });
    });
  });
});