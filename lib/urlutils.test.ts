import {
  getPlaybackUrl,
  getEmbedUrl,
  getThumbnailUrl,
  getStoryboardUrl,
  parseVideoId,
  buildShareUrl,
  isValidPlaybackId,
} from './urlutils';

describe('urlutils', () => {
  const mockOrigin = 'https://stream.new';
  
  beforeEach(() => {
    // Mock window.location.origin
    delete window.location;
    window.location = {
      origin: mockOrigin,
      hostname: 'stream.new',
      protocol: 'https:',
    };
  });

  describe('getPlaybackUrl', () => {
    it('should generate basic playback URL', () => {
      const url = getPlaybackUrl('test-playback-id');
      expect(url).toBe('https://stream.mux.com/test-playback-id.m3u8');
    });

    it('should generate playback URL with token', () => {
      const url = getPlaybackUrl('test-playback-id', 'jwt-token-123');
      expect(url).toBe('https://stream.mux.com/test-playback-id.m3u8?token=jwt-token-123');
    });

    it('should handle custom domain', () => {
      const url = getPlaybackUrl('test-playback-id', null, 'custom.domain.com');
      expect(url).toBe('https://custom.domain.com/test-playback-id.m3u8');
    });

    it('should generate mp4 URL when specified', () => {
      const url = getPlaybackUrl('test-playback-id', null, null, 'mp4');
      expect(url).toBe('https://stream.mux.com/test-playback-id/high.mp4');
    });
  });

  describe('getEmbedUrl', () => {
    it('should generate embed URL with default player', () => {
      const url = getEmbedUrl('test-playback-id');
      expect(url).toBe('https://stream.new/v/test-playback-id/embed');
    });

    it('should generate embed URL with specific player', () => {
      const url = getEmbedUrl('test-playback-id', 'plyr');
      expect(url).toBe('https://stream.new/v/test-playback-id/plyr/embed');
    });

    it('should include query parameters', () => {
      const url = getEmbedUrl('test-playback-id', 'mux', {
        time: 30,
        color: 'ff0000',
        autoplay: true,
      });
      expect(url).toBe('https://stream.new/v/test-playback-id/embed?time=30&color=ff0000&autoplay=true');
    });

    it('should handle localhost differently', () => {
      window.location.hostname = 'localhost';
      window.location.origin = 'http://localhost:3000';
      
      const url = getEmbedUrl('test-playback-id');
      expect(url).toBe('http://localhost:3000/v/test-playback-id/embed');
    });
  });

  describe('getThumbnailUrl', () => {
    it('should generate basic thumbnail URL', () => {
      const url = getThumbnailUrl('test-playback-id');
      expect(url).toBe('https://image.mux.com/test-playback-id/thumbnail.jpg');
    });

    it('should generate thumbnail with parameters', () => {
      const url = getThumbnailUrl('test-playback-id', {
        time: 10,
        width: 640,
        height: 360,
        fit_mode: 'crop',
      });
      expect(url).toBe('https://image.mux.com/test-playback-id/thumbnail.jpg?time=10&width=640&height=360&fit_mode=crop');
    });

    it('should handle animated thumbnails', () => {
      const url = getThumbnailUrl('test-playback-id', { animated: true });
      expect(url).toBe('https://image.mux.com/test-playback-id/animated.gif');
    });

    it('should generate thumbnail with token', () => {
      const url = getThumbnailUrl('test-playback-id', {}, 'jwt-token');
      expect(url).toBe('https://image.mux.com/test-playback-id/thumbnail.jpg?token=jwt-token');
    });
  });

  describe('getStoryboardUrl', () => {
    it('should generate storyboard URL', () => {
      const url = getStoryboardUrl('test-playback-id');
      expect(url).toBe('https://image.mux.com/test-playback-id/storyboard.jpg');
    });

    it('should include format parameter', () => {
      const url = getStoryboardUrl('test-playback-id', 'vtt');
      expect(url).toBe('https://image.mux.com/test-playback-id/storyboard.vtt');
    });
  });

  describe('parseVideoId', () => {
    it('should parse playback ID from URL path', () => {
      const id = parseVideoId('/v/test-playback-id');
      expect(id).toBe('test-playback-id');
    });

    it('should parse playback ID from URL with player type', () => {
      const id = parseVideoId('/v/test-playback-id/plyr');
      expect(id).toBe('test-playback-id');
    });

    it('should parse playback ID from full URL', () => {
      const id = parseVideoId('https://stream.new/v/test-playback-id');
      expect(id).toBe('test-playback-id');
    });

    it('should return null for invalid URLs', () => {
      expect(parseVideoId('/invalid/path')).toBeNull();
      expect(parseVideoId('')).toBeNull();
      expect(parseVideoId(null)).toBeNull();
    });

    it('should handle embed URLs', () => {
      const id = parseVideoId('/v/test-playback-id/embed');
      expect(id).toBe('test-playback-id');
    });
  });

  describe('buildShareUrl', () => {
    it('should build basic share URL', () => {
      const url = buildShareUrl('test-playback-id');
      expect(url).toBe('https://stream.new/v/test-playback-id');
    });

    it('should include query parameters', () => {
      const url = buildShareUrl('test-playback-id', {
        time: 30,
        color: 'ff0000',
      });
      expect(url).toBe('https://stream.new/v/test-playback-id?time=30&color=ff0000');
    });

    it('should handle empty parameters', () => {
      const url = buildShareUrl('test-playback-id', {});
      expect(url).toBe('https://stream.new/v/test-playback-id');
    });

    it('should filter out null/undefined parameters', () => {
      const url = buildShareUrl('test-playback-id', {
        time: 30,
        color: null,
        autoplay: undefined,
      });
      expect(url).toBe('https://stream.new/v/test-playback-id?time=30');
    });
  });

  describe('isValidPlaybackId', () => {
    it('should validate correct playback IDs', () => {
      expect(isValidPlaybackId('Hi6we01h00uVvZc00GzvVXZW8C02Y8QC8OX7')).toBe(true);
      expect(isValidPlaybackId('UNDUU7tU7vYt02CRMDTlZd1qKjvk41LN6yI5LbHgtxo8')).toBe(true);
    });

    it('should reject invalid playback IDs', () => {
      expect(isValidPlaybackId('too-short')).toBe(false);
      expect(isValidPlaybackId('invalid-characters!')).toBe(false);
      expect(isValidPlaybackId('')).toBe(false);
      expect(isValidPlaybackId(null)).toBe(false);
      expect(isValidPlaybackId(undefined)).toBe(false);
    });

    it('should reject IDs with wrong length', () => {
      expect(isValidPlaybackId('Hi6we01h00uVvZc00GzvVXZW8C02Y8QC8OX')).toBe(false); // Too short
      expect(isValidPlaybackId('Hi6we01h00uVvZc00GzvVXZW8C02Y8QC8OX7X')).toBe(false); // Too long
    });
  });
});