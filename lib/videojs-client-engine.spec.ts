import { hasMediaSource, resolveClientEngine } from './videojs-client-engine';

const MSE = { MediaSource: function MediaSource() {} };
const MMS = { ManagedMediaSource: function ManagedMediaSource() {} };

describe('hasMediaSource', () => {
  test('is true with MediaSource or ManagedMediaSource', () => {
    expect(hasMediaSource(MSE)).toBe(true);
    expect(hasMediaSource(MMS)).toBe(true);
  });

  test('is false with neither', () => {
    expect(hasMediaSource({})).toBe(false);
  });
});

describe('resolveClientEngine', () => {
  test('keeps SPF where Media Source Extensions exist', () => {
    expect(resolveClientEngine('spf', MSE)).toEqual({ engine: 'spf' });
    expect(resolveClientEngine('spf', MMS)).toEqual({ engine: 'spf' });
  });

  test('falls back from SPF to hls.js without Media Source Extensions', () => {
    expect(resolveClientEngine('spf', {})).toEqual({ engine: 'hlsjs', fallback: 'no-mse' });
  });

  test('never changes an hls.js choice', () => {
    expect(resolveClientEngine('hlsjs', MSE)).toEqual({ engine: 'hlsjs' });
    expect(resolveClientEngine('hlsjs', {})).toEqual({ engine: 'hlsjs' });
  });

  test('reads the globals of the environment by default', () => {
    // jsdom has no MediaSource.
    expect(resolveClientEngine('spf')).toEqual({ engine: 'hlsjs', fallback: 'no-mse' });
  });
});
