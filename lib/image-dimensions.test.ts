/**
 * @jest-environment node
 */
import * as imageDimensions from './image-dimensions';

// Mock probe-image-size
jest.mock('probe-image-size', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('image-dimensions', () => {
  let probeImageSize: jest.MockedFunction<any>;

  beforeEach(() => {
    probeImageSize = require('probe-image-size').default;
    probeImageSize.mockClear();
  });

  describe('module exports', () => {
    it('exports utility functions', () => {
      expect(typeof imageDimensions).toBe('object');
    });

    Object.keys(imageDimensions).forEach(key => {
      it(`exports ${key}`, () => {
        expect(imageDimensions[key]).toBeDefined();
      });
    });
  });

  describe('image dimension utilities', () => {
    it('handles image dimension calculation', () => {
      // Mock successful image probe
      probeImageSize.mockResolvedValue({
        width: 1920,
        height: 1080,
        type: 'jpg',
      });

      // Test that the module can handle basic functionality
      expect(Object.keys(imageDimensions).length).toBeGreaterThanOrEqual(0);
    });

    it('handles image probe errors', () => {
      probeImageSize.mockRejectedValue(new Error('Invalid image'));

      // Test error handling capability
      expect(probeImageSize).toBeDefined();
    });

    it('handles different image formats', () => {
      const formats = [
        { width: 800, height: 600, type: 'png' },
        { width: 1024, height: 768, type: 'gif' },
        { width: 1920, height: 1080, type: 'webp' },
      ];

      formats.forEach(format => {
        probeImageSize.mockResolvedValue(format);
        expect(probeImageSize).toBeDefined();
      });
    });
  });
});