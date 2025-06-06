/**
 * @jest-environment node
 */
// @ts-nocheck


import { autoDelete } from './moderation-action';
import nock, { Scope } from 'nock';

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