'use client';

/*
 * Client leaf that selects the video.js v10 MuxVideo engine flavor via
 * next/dynamic. This exists purely for code-splitting: client references
 * reachable from a server component's module graph are merged into the route's
 * client chunks whether or not they render (a conditional `await import()` in
 * the server component does NOT split them — measured: both engines shipped to
 * both /v routes, 2,065KB decoded JS each). next/dynamic inside a client
 * component is what actually keeps each engine in its own lazy chunk, and it
 * still SSRs (no `ssr: false` — see the v10 friction log's CLS findings; the
 * v10 working docs are kept outside this repo). (CJP)
 */
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type { ComponentProps, SyntheticEvent } from 'react';

const MuxVideoSpf = dynamic(() =>
  import('@videojs/react/media/mux-video/spf').then((m) => m.MuxVideo)
);
const MuxVideoHlsjs = dynamic(() =>
  import('@videojs/react/media/mux-video/hls-js').then((m) => m.MuxVideo)
);

type Props = Omit<ComponentProps<typeof MuxVideoSpf>, 'ref'> & {
  engine: 'spf' | 'hlsjs';
  /*
   * "Start at t seconds" (?time=). rc.2 has no declarative start time on the
   * media components (v10 friction log item 4), so two mechanisms:
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

const VideojsV10Media = ({ engine, startTime, onLoadedMetadata, source, ...mediaProps }: Props) => {
  const didSeekRef = useRef(false);

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
    return <MuxVideoHlsjs {...mediaProps} source={hlsjsSource} onLoadedMetadata={handleLoadedMetadata} />;
  }
  return <MuxVideoSpf {...mediaProps} source={source} onLoadedMetadata={handleLoadedMetadata} />;
};

export default VideojsV10Media;
