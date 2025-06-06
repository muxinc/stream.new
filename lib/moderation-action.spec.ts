/**
 * @jest-environment node
 */

import { autoDelete } from './moderation-action';
import nock, { Scope } from 'nock';

const assetId = 'asset-123';
const playbackId = 'playback-123';

let scopeMux: Scope;
let scopeAirtable: Scope;
let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  nock.disableNetConnect();
  originalEnv = { ...process.env };
  
  // Set up environment variables for Airtable and Mux
  process.env.AIRTABLE_KEY = 'test-key';
  process.env.AIRTABLE_BASE_ID = 'test-base-id';
  process.env.MUX_TOKEN_ID = 'test-token-id';
  process.env.MUX_TOKEN_SECRET = 'test-token-secret';
  
  scopeMux = nock('https://api.mux.com:443')
    .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
    .reply(204);
    
  scopeAirtable = nock('https://api.airtable.com:443')
    .post('/v0/test-base-id/Auto%20Deleted')
    .reply(200);
});

afterEach(() => {
  process.env = originalEnv;
  nock.cleanAll();
});

describe('autoDelete - Adult Content Detection', () => {
  test('deletes content when adult score equals threshold (0.95)', async () => {
    const hiveScores = { adult: 0.95, suggestive: 0.11, violent: 0.234 };
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(true);
    expect(scopeMux.isDone()).toBe(true);
    expect(scopeAirtable.isDone()).toBe(true);
  });

  test('deletes content when adult score exceeds threshold', async () => {
    const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(true);
  });

  test('does NOT delete when adult score is just below threshold (0.94)', async () => {
    const hiveScores = { adult: 0.94, suggestive: 0.11, violent: 0.234 };
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(false);
  });
});

describe('autoDelete - Violence Detection', () => {
  test('deletes content when violence score equals threshold (0.85)', async () => {
    const hiveScores = { adult: 0.78, suggestive: 0.11, violent: 0.85 };
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(true);
    expect(scopeMux.isDone()).toBe(true);
    expect(scopeAirtable.isDone()).toBe(true);
  });

  test('deletes content when violence score exceeds threshold', async () => {
    const hiveScores = { adult: 0.78, suggestive: 0.11, violent: 0.91 };
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(true);
  });

  test('does NOT delete when violence score is just below threshold (0.84)', async () => {
    const hiveScores = { adult: 0.78, suggestive: 0.11, violent: 0.84 };
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(false);
  });
});

describe('autoDelete - Edge Cases', () => {
  test('handles null hiveScores gracefully', async () => {
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores: null as any });
    
    expect(isDeleted).toBe(false);
  });

  test('handles undefined hiveScores gracefully', async () => {
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores: undefined as any });
    
    expect(isDeleted).toBe(false);
  });

  test('handles missing adult property', async () => {
    const hiveScores = { suggestive: 0.11, violent: 0.234 } as any;
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(false);
  });

  test('handles missing violent property', async () => {
    const hiveScores = { adult: 0.78, suggestive: 0.11 } as any;
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(false);
  });

  test('handles null adult score', async () => {
    const hiveScores = { adult: null, suggestive: 0.11, violent: 0.234 } as any;
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(false);
  });

  test('handles null violent score', async () => {
    const hiveScores = { adult: 0.78, suggestive: 0.11, violent: null } as any;
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(false);
  });
});

describe('autoDelete - Both Conditions', () => {
  test('deletes when both adult and violence exceed thresholds', async () => {
    const hiveScores = { adult: 0.96, suggestive: 0.11, violent: 0.90 };
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(true);
  });

  test('does NOT delete when neither condition is met', async () => {
    const hiveScores = { adult: 0.89, suggestive: 0.11, violent: 0.234 };
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(false);
  });
});

describe('autoDelete - Airtable Integration', () => {
  test('sends correct data to Airtable when deletion occurs', async () => {
    const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
    
    // Create more specific Airtable mock to verify request body
    nock.cleanAll();
    scopeMux = nock('https://api.mux.com:443')
      .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
      .reply(204);
    
    const airtableScope = nock('https://api.airtable.com:443')
      .post('/v0/test-base-id/Auto%20Deleted', (body) => {
        expect(body).toEqual({
          records: [
            {
              fields: {
                assetId: 'asset-123',
                notes: JSON.stringify(hiveScores)
              }
            }
          ]
        });
        return true;
      })
      .reply(200);
    
    await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(airtableScope.isDone()).toBe(true);
  });

  test('handles missing AIRTABLE_KEY gracefully', async () => {
    delete process.env.AIRTABLE_KEY;
    const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
    
    // Should not call Airtable API
    nock.cleanAll();
    scopeMux = nock('https://api.mux.com:443')
      .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
      .reply(204);
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(true);
    expect(scopeMux.isDone()).toBe(true);
    // No Airtable call should be made
  });

  test('handles missing AIRTABLE_BASE_ID gracefully', async () => {
    delete process.env.AIRTABLE_BASE_ID;
    const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
    
    // Should not call Airtable API
    nock.cleanAll();
    scopeMux = nock('https://api.mux.com:443')
      .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
      .reply(204);
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(true);
    expect(scopeMux.isDone()).toBe(true);
    // No Airtable call should be made
  });

  test('handles Airtable API errors gracefully', async () => {
    const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    nock.cleanAll();
    scopeMux = nock('https://api.mux.com:443')
      .delete(`/video/v1/assets/${assetId}/playback-ids/${playbackId}`)
      .reply(204);
    
    const airtableScope = nock('https://api.airtable.com:443')
      .post('/v0/test-base-id/Auto%20Deleted')
      .reply(500, { error: 'Internal Server Error' });
    
    const isDeleted = await autoDelete({ assetId, playbackId, hiveScores });
    
    expect(isDeleted).toBe(true); // Deletion should still succeed
    expect(scopeMux.isDone()).toBe(true);
    expect(airtableScope.isDone()).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error reporting to airtable',
      '{"error":"Internal Server Error"}',
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });
});

