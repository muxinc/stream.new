'use client';

/*
 * Client leaf that selects the video.js MuxVideo engine flavor via
 * next/dynamic. This exists purely for code-splitting: client references
 * reachable from a server component's module graph are merged into the route's
 * client chunks whether or not they render (a conditional `await import()` in
 * the server component does NOT split them — measured: both engines shipped to
 * both /v routes, 2,065KB decoded JS each). next/dynamic inside a client
 * component is what actually keeps each engine in its own lazy chunk, and it
 * still SSRs (no `ssr: false` — see the video.js friction log's CLS findings; the
 * video.js working docs are kept outside this repo). (CJP)
 *
 * It is also where playback errors are reported to Sentry (see below).
 */
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentProps, SyntheticEvent } from 'react';
import * as Sentry from '@sentry/nextjs';
import type { VideojsEngine } from '../lib/videojs-engine';
import { resolveClientEngine } from '../lib/videojs-client-engine';
import type { ClientEngine } from '../lib/videojs-client-engine';

/*
 * ENGINE IMPORT SPECIFIERS — the one place to change them. The default Mux
 * media import is the SPF-backed one (the same class as `/spf`); hls.js is
 * the explicit `/hls-js` flavor. Specifiers must stay string literals for
 * next/dynamic, and each stays its own lazy chunk.
 */
const MuxVideoSpf = dynamic(() =>
  import('@videojs/react/media/mux-video').then((m) => m.MuxVideo)
);
const MuxVideoHlsjs = dynamic(() =>
  import('@videojs/react/media/mux-video/hls-js').then((m) => m.MuxVideo)
);

/*
 * What both engines' media adapters share for error reporting: an EventTarget
 * that fires `error` for fatal conditions only (SPF promotes only fatal
 * conditions to `error`; the hls.js flavor filters on `data.fatal`; both
 * forward the <video> element's own MediaError) and exposes it as `error`.
 * SPF's `code` is an SVTA code (e.g. 99001 unsupported playback feature),
 * hls.js's a MediaError.MEDIA_ERR_* value.
 */
type ErrorReportingMedia = EventTarget & {
  readonly error?: { code?: number; message?: string; data?: unknown } | null;
  readonly currentTime?: number;
};

type Props = Omit<ComponentProps<typeof MuxVideoSpf>, 'ref' | 'mediaRef' | 'crossOrigin'> & {
  // The two flavors type this differently (SPF also takes null).
  crossOrigin?: 'anonymous' | 'use-credentials';
  // The server's choice; the client may correct it (see below).
  engine: VideojsEngine;
  // Sentry tags only.
  playerType: string;
  playbackId: string;
  /*
   * "Start at t seconds" (?time=). The media components have no declarative
   * start time (video.js friction log item 4), so two mechanisms:
   * - hls.js flavor: `source.engine.hlsJs.startPosition` — hls.js begins
   *   loading at t (no fragment-0 fetch, no visible seek). Applies on every
   *   MSE path (the adapter picks MSE whenever hls.js is supported), but not
   *   on iOS's native-HLS path, and SPF has no engine-config surface at all.
   * - fallback for both: seek once on the first `loadedmetadata`. Safe under
   *   SSR because every flavor sets `src` client-side after hydration, so the
   *   event can't fire before React attaches the handler. Harmless when
   *   startPosition already applied (same target time). (CJP)
   */
  startTime?: number;
};

// hls.js error payloads hold the Hls instance, buffers and response bodies;
// keep the few scalar fields that identify the failure.
const describeErrorData = (data: unknown): Record<string, unknown> | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (['string', 'number', 'boolean'].includes(typeof value)) out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
};

const VideojsMedia = ({ engine: serverEngine, playerType, playbackId, startTime, onLoadedMetadata, source, ...mediaProps }: Props) => {
  const didSeekRef = useRef(false);
  const [media, setMedia] = useState<ErrorReportingMedia | null>(null);
  const mediaRef = useCallback((m: unknown) => setMedia(m as ErrorReportingMedia | null), []);

  /*
   * The server picks the engine without seeing the browser; SPF needs Media
   * Source Extensions and has no native-HLS fallback, so a browser without
   * them gets the hls.js flavor instead (lib/videojs-client-engine.ts).
   *
   * Decided after mount so hydration renders what the server rendered. Until
   * then the SPF media gets no source — it loads on source assignment, and
   * loading is what throws without MSE — so the unsupported engine never
   * starts. That costs supported browsers one extra render, no request.
   */
  const [clientEngine, setClientEngine] = useState<ClientEngine | null>(null);
  useEffect(() => setClientEngine(resolveClientEngine(serverEngine)), [serverEngine]);
  const engine = clientEngine?.engine ?? serverEngine;
  const fallback = clientEngine?.fallback;
  const sourceReady = serverEngine !== 'spf' || clientEngine !== null;

  /*
   * Tag everything Sentry captures while this player is on the page with the
   * engine in use, so unrelated errors (hydration, chunk loads, unhandled
   * rejections inside an engine) can still be sliced by SPF vs hls.js.
   * `videojs_engine` is the engine actually used; `videojs_engine_fallback`
   * marks pages where that isn't the server's choice.
   */
  useEffect(() => {
    if (!clientEngine) return;
    const scope = Sentry.getCurrentScope();
    scope.setTags({ videojs_engine: engine, videojs_engine_fallback: fallback, player_type: playerType, playback_id: playbackId });
    return () => {
      scope.setTags({ videojs_engine: undefined, videojs_engine_fallback: undefined, player_type: undefined, playback_id: undefined });
    };
  }, [clientEngine, engine, fallback, playerType, playbackId]);

  /*
   * Report fatal playback errors. Neither engine throws them — they surface
   * as an `error` event on the media adapter and in the skin's error dialog —
   * so without this nothing reaches Sentry. One event per distinct error per
   * mount; grouped per engine + code.
   */
  useEffect(() => {
    if (!media) return;
    let lastReported: string | undefined;

    const onError = () => {
      const error = media.error;
      if (!error) return;
      const code = error.code ?? 'unknown';
      const message = error.message || 'no message';
      const key = `${code}:${message}`;
      if (key === lastReported) return;
      lastReported = key;

      Sentry.withScope((scope) => {
        scope.setTags({
          videojs_engine: engine,
          videojs_engine_fallback: fallback,
          player_type: playerType,
          playback_id: playbackId,
          media_error_code: String(code),
        });
        scope.setContext('media_error', {
          code,
          message,
          current_time: media.currentTime,
          data: describeErrorData(error.data),
        });
        scope.setFingerprint(['videojs-playback-error', engine, String(code)]);
        scope.setLevel('error');
        Sentry.captureException(new Error(`video.js playback error (${engine}, code ${code}): ${message}`));
      });
    };

    media.addEventListener('error', onError);
    return () => media.removeEventListener('error', onError);
  }, [media, engine, fallback, playerType, playbackId]);

  const handleLoadedMetadata = (evt: SyntheticEvent<HTMLVideoElement>) => {
    onLoadedMetadata?.(evt);
    if (!startTime || didSeekRef.current) return;
    didSeekRef.current = true;
    if (Math.abs(evt.currentTarget.currentTime - startTime) > 0.5) {
      evt.currentTarget.currentTime = startTime;
    }
  };

  if (engine === 'hlsjs') {
    const hlsjsSource = source && startTime
      ? { ...source, engine: { hlsJs: { startPosition: startTime } } }
      : source;
    return <MuxVideoHlsjs {...mediaProps} mediaRef={mediaRef} source={hlsjsSource} onLoadedMetadata={handleLoadedMetadata} />;
  }
  return <MuxVideoSpf {...mediaProps} mediaRef={mediaRef} source={sourceReady ? source : undefined} onLoadedMetadata={handleLoadedMetadata} />;
};

export default VideojsMedia;
