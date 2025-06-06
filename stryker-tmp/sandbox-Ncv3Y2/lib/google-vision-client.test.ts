/**
 * @jest-environment node
 */
// @ts-nocheck

import client, { isEnabled } from './google-vision-client';

// Mock Google Cloud Vision
jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
    safeSearchDetection: jest.fn(),
    batchAnnotateImages: jest.fn(),
  })),
}));

describe('google-vision-client', () => {

  describe('isEnabled', () => {
    it('should return true when GOOGLE_APPLICATION_CREDENTIALS is set', () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = 'test-credentials';
      expect(isEnabled()).toBe(true);
    });

    it('should return false when GOOGLE_APPLICATION_CREDENTIALS is not set', () => {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      expect(isEnabled()).toBe(false);
    });
  });

  describe('client', () => {
    it('should export the vision client', () => {
      expect(client).toBeDefined();
    });
  });

});