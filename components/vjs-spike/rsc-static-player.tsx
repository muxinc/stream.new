/*
 * Spike variant: NO 'use client' directive and NO next/dynamic in app code.
 * This module is a server component that statically imports the v10 components;
 * if @videojs/react's own 'use client' banners are sufficient, Next treats them
 * as client components automatically (SSR'd + hydrated) with no app-level
 * boundary. Note: as a server component, this module cannot pass function props
 * (event handlers) to the players — serializable props only. (CJP)
 */
import '@videojs/react/video/skin.css';
import { VideoPlayer, VideoSkin } from '@videojs/react/video';
import { MuxVideo as MuxVideoSpf } from '@videojs/react/media/mux-video/spf';
import { MuxVideo as MuxVideoHlsjs } from '@videojs/react/media/mux-video/hls-js';

import type { SpikePlayerProps } from './types';

const RscStaticPlayer = ({ playbackId, engine }: SpikePlayerProps) => {
  // NOTE: Importing both engine flavors statically double-bundles them; fine for
  // a spike, but a real route would pick one import per module. (CJP)
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

export default RscStaticPlayer;
