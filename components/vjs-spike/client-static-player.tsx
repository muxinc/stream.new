'use client';

/*
 * Spike variant: explicit 'use client' boundary in app code, static imports
 * (no next/dynamic). Markup is identical to rsc-static-player for comparison. (CJP)
 */
import '@videojs/react/video/skin.css';
import { VideoPlayer, VideoSkin } from '@videojs/react/video';
import { MuxVideo as MuxVideoSpf } from '@videojs/react/media/mux-video/spf';
import { MuxVideo as MuxVideoHlsjs } from '@videojs/react/media/mux-video/hls-js';

import type { SpikePlayerProps } from './types';

const ClientStaticPlayer = ({ playbackId, engine }: SpikePlayerProps) => {
  const MuxVideo = engine === 'hlsjs' ? MuxVideoHlsjs : MuxVideoSpf;
  return (
    <VideoPlayer>
      <VideoSkin style={{ aspectRatio: '16 / 9', width: '100%' }}>
        <MuxVideo
          source={{ playbackId }}
          crossOrigin="anonymous"
          preload="metadata"
          playsInline
        />
      </VideoSkin>
    </VideoPlayer>
  );
};

export default ClientStaticPlayer;
