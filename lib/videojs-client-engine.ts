import type { VideojsEngine } from './videojs-engine';

/*
 * Client-side correction to the server's engine choice.
 *
 * SPF plays through Media Source Extensions only: it has no native-HLS
 * fallback, and without `MediaSource` or `ManagedMediaSource` it throws
 * "MediaSource API is not supported". The hls.js-backed Mux media falls back
 * to the browser's native HLS there (e.g. iPhone Safari before iOS 17.1). The
 * server-side picker (lib/videojs-engine.ts) can't see the browser, so the
 * client swaps SPF for hls.js when neither API exists.
 */
export type ClientEngine = {
  engine: VideojsEngine;
  // Why the engine differs from the server's choice, when it does.
  fallback?: 'no-mse';
};

type MediaSourceGlobals = { MediaSource?: unknown; ManagedMediaSource?: unknown };

export function hasMediaSource(globals: MediaSourceGlobals = globalThis as MediaSourceGlobals): boolean {
  return Boolean(globals.MediaSource || globals.ManagedMediaSource);
}

export function resolveClientEngine(
  engine: VideojsEngine,
  globals: MediaSourceGlobals = globalThis as MediaSourceGlobals
): ClientEngine {
  if (engine === 'spf' && !hasMediaSource(globals)) {
    return { engine: 'hlsjs', fallback: 'no-mse' };
  }
  return { engine };
}
