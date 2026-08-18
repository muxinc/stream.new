'use client';

import { useEffect, useRef } from 'react';

import '@videojs/react/video/skin.css';
import { VideoPlayer, VideoSkin } from '@videojs/react/video';
// NOTE: The SPF-backed flavor of MuxVideo must be imported explicitly;
// the bare '@videojs/react/media/mux-video' subpath is the hls.js-backed one. (CJP)
import { MuxVideo } from '@videojs/react/media/mux-video/spf';
import { MuxData } from '@videojs/react/media/mux-data';
import { MUX_DATA_CUSTOM_DOMAIN } from '../constants';

type Props = {
  playbackId: string;
  poster: string;
  currentTime?: number;
  blurDataURL?: string;
  onLoaded: () => void;
  onError: (error: ErrorEvent) => void;
};

const VideojsV10Spf: React.FC<Props> = ({
  playbackId,
  poster,
  currentTime,
  blurDataURL,
  onLoaded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // NOTE: Like the other player components, fire onLoaded on mount rather than on
  // loadedmetadata. PlayerPage keeps its 'centered loading' layout until onLoaded,
  // so firing it later causes a large visible layout shift. (CJP)
  useEffect(() => {
    onLoaded();
  }, []);

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && currentTime) {
      video.currentTime = currentTime;
    }
  };

  const onError = (evt: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn(
      'Got an onError from the video.js v10 (SPF) media, the player UI should be showing an error',
      evt
    );
  };

  return (
    <VideoPlayer>
      <VideoSkin
        poster={poster}
        placeholder={blurDataURL}
        // Sizing is reserved by the wrapper in PlayerLoader (CLS avoidance); fill it. (CJP)
        style={{ width: '100%', height: '100%' }}
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
          playerSoftwareName="videojs-v10-spf"
          metadata={{
            video_id: playbackId,
            video_title: playbackId,
            player_name: 'video.js v10 (SPF-backed MuxVideo)',
          }}
        />
      </VideoSkin>
    </VideoPlayer>
  );
};

VideojsV10Spf.displayName = 'VideojsV10Spf';

export default VideojsV10Spf;
