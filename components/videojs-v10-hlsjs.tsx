'use client';

import { useRef } from 'react';

import '@videojs/react/video/skin.css';
import { VideoPlayer, VideoSkin } from '@videojs/react/video';
// NOTE: The hls.js-backed flavor is what the bare '@videojs/react/media/mux-video'
// subpath resolves to, but we import it explicitly to keep the two routes symmetrical. (CJP)
import { MuxVideo } from '@videojs/react/media/mux-video/hls-js';
import { MuxData } from '@videojs/react/media/mux-data';
import { MUX_DATA_CUSTOM_DOMAIN } from '../constants';

type Props = {
  playbackId: string;
  poster: string;
  currentTime?: number;
  aspectRatio: number;
  blurDataURL?: string;
  onLoaded: () => void;
  onError: (error: ErrorEvent) => void;
};

const VideojsV10Hlsjs: React.FC<Props> = ({
  playbackId,
  poster,
  currentTime,
  aspectRatio,
  blurDataURL,
  onLoaded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && currentTime) {
      video.currentTime = currentTime;
    }
    onLoaded();
  };

  const onError = (evt: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn(
      'Got an onError from the video.js v10 (hls.js) media, the player UI should be showing an error',
      evt
    );
  };

  return (
    <VideoPlayer>
      <VideoSkin
        poster={poster}
        placeholder={blurDataURL}
        style={{
          aspectRatio: `${aspectRatio}`,
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          height: '100%',
        }}
      >
        <MuxVideo
          ref={videoRef}
          source={{
            playbackId,
            customDomain: process.env.NEXT_PUBLIC_MUX_BYO_DOMAIN || undefined,
          }}
          crossOrigin="anonymous"
          streamType="on-demand"
          preload="metadata"
          onLoadedMetadata={onLoadedMetadata}
          onError={onError}
          playsInline
        />
        <MuxData
          beaconCollectionDomain={MUX_DATA_CUSTOM_DOMAIN}
          envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
          playerSoftwareName="videojs-v10-hlsjs"
          metadata={{
            video_id: playbackId,
            video_title: playbackId,
            player_name: 'video.js v10 (hls.js-backed MuxVideo)',
          }}
        />
      </VideoSkin>
    </VideoPlayer>
  );
};

VideojsV10Hlsjs.displayName = 'VideojsV10Hlsjs';

export default VideojsV10Hlsjs;
