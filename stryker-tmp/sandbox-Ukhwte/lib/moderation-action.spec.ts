/**
 * @jest-environment node
 */
// @ts-nocheck


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
  
  // Set up environment variables for Airtable
  process.env.AIRTABLE_KEY = 'test-key';
  process.env.AIRTABLE_BASE_ID = 'test-base-id';
  
  scopeMux = nock('https://api.mux.com/video/v1/')
    .delete(`/assets/${assetId}/playback-ids/${playbackId}`)
    .reply(204);
    
  scopeAirtable = nock('https://api.airtable.com/v0')
    .post('/test-base-id/Auto%20Deleted')
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
    scopeMux = nock('https://api.mux.com/video/v1/')
      .delete(`/assets/${assetId}/playback-ids/${playbackId}`)
      .reply(204);
    
    const airtableScope = nock('https://api.airtable.com/v0')
      .post('/test-base-id/Auto%20Deleted', (body) => {
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
    scopeMux = nock('https://api.mux.com/video/v1/')
      .delete(`/assets/${assetId}/playback-ids/${playbackId}`)
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
    scopeMux = nock('https://api.mux.com/video/v1/')
      .delete(`/assets/${assetId}/playback-ids/${playbackId}`)
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
    scopeMux = nock('https://api.mux.com/video/v1/')
      .delete(`/assets/${assetId}/playback-ids/${playbackId}`)
      .reply(204);
    
    const airtableScope = nock('https://api.airtable.com/v0')
      .post('/test-base-id/Auto%20Deleted')
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

// Add tests specifically to catch remaining mutations
describe('autoDelete - Mutation Testing Edge Cases', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    nock.disableNetConnect();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    nock.cleanAll();
  });

  test('calls Airtable with correct authorization header', async () => {
    process.env.AIRTABLE_KEY = 'test-secret-key';
    process.env.AIRTABLE_BASE_ID = 'test-base-id';
    
    const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
    
    const muxScope = nock('https://api.mux.com/video/v1/')
      .delete('/assets/asset-123/playback-ids/playback-123')
      .reply(204);
    
    // Verify the Authorization header is set correctly
    const airtableScope = nock('https://api.airtable.com/v0')
      .post('/test-base-id/Auto%20Deleted')
      .matchHeader('Authorization', 'Bearer test-secret-key')
      .reply(200);
    
    const isDeleted = await autoDelete({ 
      assetId: 'asset-123', 
      playbackId: 'playback-123', 
      hiveScores 
    });
    
    expect(isDeleted).toBe(true);
    expect(muxScope.isDone()).toBe(true);
    expect(airtableScope.isDone()).toBe(true);
  });

  test('does not call Airtable when AIRTABLE_KEY is empty string', async () => {
    process.env.AIRTABLE_KEY = '';
    process.env.AIRTABLE_BASE_ID = 'test-base-id';
    
    const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
    
    const muxScope = nock('https://api.mux.com/video/v1/')
      .delete('/assets/asset-123/playback-ids/playback-123')
      .reply(204);
    
    // No Airtable call should be made
    const isDeleted = await autoDelete({ 
      assetId: 'asset-123', 
      playbackId: 'playback-123', 
      hiveScores 
    });
    
    expect(isDeleted).toBe(true);
    expect(muxScope.isDone()).toBe(true);
    // No Airtable scope to check - it shouldn't be called
  });

  test('does not call Airtable when AIRTABLE_BASE_ID is empty string', async () => {
    process.env.AIRTABLE_KEY = 'test-key';
    process.env.AIRTABLE_BASE_ID = '';
    
    const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
    
    const muxScope = nock('https://api.mux.com/video/v1/')
      .delete('/assets/asset-123/playback-ids/playback-123')
      .reply(204);
    
    // No Airtable call should be made
    const isDeleted = await autoDelete({ 
      assetId: 'asset-123', 
      playbackId: 'playback-123', 
      hiveScores 
    });
    
    expect(isDeleted).toBe(true);
    expect(muxScope.isDone()).toBe(true);
  });

  test('handles Airtable error with undefined response body', async () => {
    process.env.AIRTABLE_KEY = 'test-key';
    process.env.AIRTABLE_BASE_ID = 'test-base-id';
    
    const hiveScores = { adult: 0.99, suggestive: 0.11, violent: 0.234 };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const muxScope = nock('https://api.mux.com/video/v1/')
      .delete('/assets/asset-123/playback-ids/playback-123')
      .reply(204);
    
    // Simulate error without response body
    const airtableScope = nock('https://api.airtable.com/v0')
      .post('/test-base-id/Auto%20Deleted')
      .replyWithError('Network error');
    
    const isDeleted = await autoDelete({ 
      assetId: 'asset-123', 
      playbackId: 'playback-123', 
      hiveScores 
    });
    
    expect(isDeleted).toBe(true);
    expect(muxScope.isDone()).toBe(true);
    expect(airtableScope.isDone()).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error reporting to airtable',
      undefined, // response?.body should be undefined
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });
});