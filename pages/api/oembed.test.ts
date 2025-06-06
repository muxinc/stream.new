/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http';
import handler from './oembed';

// Mock image dimensions module
jest.mock('../../lib/image-dimensions', () => ({
  getImageDimensions: jest.fn().mockResolvedValue({
    width: 640,
    height: 360,
  }),
}));

describe('/api/oembed', () => {
  it('returns oembed data for valid playback ID', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        url: 'https://stream.new/v/test-playback-id/',
        format: 'json',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonData = JSON.parse(res._getData());
    
    expect(jsonData).toMatchObject({
      type: 'video',
      version: '1.0',
      provider_name: 'stream.new',
      title: 'Video uploaded to stream.new',
      html: expect.stringContaining('iframe'),
      width: 640,
      height: 360,
      thumbnail_width: 640,
      thumbnail_height: 360,
    });
  });

  it('handles missing playback ID in URL', async () => {
    const { getImageDimensions } = require('../../lib/image-dimensions');
    getImageDimensions.mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        url: 'https://stream.new/invalid-url',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it('handles invalid playback ID', async () => {
    const { getImageDimensions } = require('../../lib/image-dimensions');
    getImageDimensions.mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        url: 'https://stream.new/v/invalid-playback-id/',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData.message).toBe('not found');
  });

  it('includes thumbnail and embed iframe', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        url: 'https://stream.new/v/test-playback-123/',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData.thumbnail_url).toContain('image.mux.com');
    expect(jsonData.html).toContain('iframe');
    expect(jsonData.html).toContain('test-playback-123');
  });

  it('handles missing URL parameter', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    // Should throw due to URL match failing
    await expect(handler(req, res)).rejects.toThrow();
  });
});