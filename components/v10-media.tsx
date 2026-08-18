'use client';

/*
 * Client leaf that selects the video.js v10 MuxVideo engine flavor via
 * next/dynamic. This exists purely for code-splitting: client references
 * reachable from a server component's module graph are merged into the route's
 * client chunks whether or not they render (a conditional `await import()` in
 * the server component does NOT split them — measured: both engines shipped to
 * both /v routes, 2,065KB decoded JS each). next/dynamic inside a client
 * component is what actually keeps each engine in its own lazy chunk, and it
 * still SSRs (no `ssr: false` — see the friction log's CLS findings). (CJP)
 */
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const MuxVideoSpf = dynamic(() =>
  import('@videojs/react/media/mux-video/spf').then((m) => m.MuxVideo)
);
const MuxVideoHlsjs = dynamic(() =>
  import('@videojs/react/media/mux-video/hls-js').then((m) => m.MuxVideo)
);

type Props = Omit<ComponentProps<typeof MuxVideoSpf>, 'ref'> & {
  engine: 'spf' | 'hlsjs';
};

const V10Media = ({ engine, ...mediaProps }: Props) => {
  const MuxVideo = engine === 'hlsjs' ? MuxVideoHlsjs : MuxVideoSpf;
  return <MuxVideo {...mediaProps} />;
};

export default V10Media;
