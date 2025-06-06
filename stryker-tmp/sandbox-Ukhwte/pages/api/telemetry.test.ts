/**
 * @jest-environment node
 */
// @ts-nocheck

import { createMocks } from 'node-mocks-http';
import handler from './telemetry';

describe('/api/telemetry', () => {
  afterEach(() => {
    delete process.env.TELEMETRY_ENDPOINT;
  });

  it('handles missing telemetry endpoint configuration', async () => {
    const telemetryBody = {
      event: 'test_event',
      data: { key: 'value' },
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: telemetryBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData.message).toBe('Nothing happened because telemetry is not configured.');
  });

  it('returns 405 for non-POST methods', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader('Allow')).toEqual(['POST']);
  });

  it('logs telemetry data to console', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const telemetryBody = {
      event: 'test_event',
      data: { key: 'value' },
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: telemetryBody,
    });

    await handler(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'test_event',
        data: { key: 'value' },
        uploaderCountry: undefined,
        uploaderCountryRegion: undefined,
        userAgent: undefined,
      })
    );

    consoleSpy.mockRestore();
  });

  it('includes geographical and user agent data in telemetry', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'user-agent': 'Test/1.0',
        'x-vercel-ip-country': 'GB',
        'x-vercel-ip-country-region': 'England',
      },
      body: { event: 'page_view' },
    });

    await handler(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'page_view',
        uploaderCountry: 'GB',
        uploaderCountryRegion: 'England',
        userAgent: 'Test/1.0',
      })
    );

    consoleSpy.mockRestore();
  });

  it('processes telemetry data structure correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const complexData = {
      event: 'video_interaction',
      data: {
        playback: {
          duration: 300,
          position: 150,
          quality: '720p',
        },
        user: {
          sessionId: 'session-123',
          isAuthenticated: false,
        },
      },
      timestamp: 1640995200000,
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'user-agent': 'Chrome/98.0',
      },
      body: complexData,
    });

    await handler(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ...complexData,
        userAgent: 'Chrome/98.0',
      })
    );

    consoleSpy.mockRestore();
  });
});