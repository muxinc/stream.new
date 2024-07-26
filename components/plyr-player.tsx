import { useState, useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import Hls from 'hls.js';
import mux from 'mux-embed';

import logger from '../lib/logger';
import { getStreamBaseUrl, getImageBaseUrl } from '../lib/urlutils';
import { breakpoints } from '../style-vars';
import { HTMLVideoElementWithPlyr } from '../types';
import { useCombinedRefs } from '../util/use-combined-refs';
import { MUX_DATA_CUSTOM_DOMAIN } from '../constants';

type Props = {
  playbackId: string
  poster: string
  aspectRatio?: number;
  // isVertical: boolean;
  currentTime?: number
  onLoaded: () => void
  onError: (error: ErrorEvent) => void;
  forwardedRef: React.ForwardedRef<HTMLVideoElementWithPlyr>;
};

const PlyrPlayer: React.FC<Props> = ({ playbackId, poster, currentTime, onLoaded, onError, forwardedRef, aspectRatio }) => {
  const videoRef = useRef<HTMLVideoElementWithPlyr>(null);
  const metaRef = useCombinedRefs(forwardedRef, videoRef);
  const playerRef = useRef<Plyr | null>(null);
  const [playerInitTime] = useState(Date.now());

  const videoError = (event: ErrorEvent) => onError(event);

  useEffect(() => {
    const video = videoRef.current;
    const src = `${getStreamBaseUrl()}/${playbackId}.m3u8`;
    let hls: Hls | undefined;
    hls = undefined;
    if (video) {
      video.addEventListener('error', videoError);
      playerRef.current = new Plyr(video, {
        previewThumbnails: { enabled: true, src: `${getImageBaseUrl()}/${playbackId}/storyboard.vtt` },
        storage: { enabled: false },
        fullscreen: {
          iosNative: true
        },
        captions: { active: true, language: 'auto', update: true }
      });

      playerRef.current.on('ready', () => onLoaded());

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // This will run in safari, where HLS is supported natively
        video.src = src;
      } else if (Hls.isSupported()) {
        // This will run in all other modern browsers
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            logger.error('hls.js fatal error');
            videoError(new ErrorEvent('HLS.js fatal error'));
          }
        });
      } else {
        console.error( // eslint-disable-line no-console
          'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API',
        );
      }

      if (typeof mux !== 'undefined' && process.env.NEXT_PUBLIC_MUX_ENV_KEY) {
        mux.monitor(video, {
          hlsjs: hls,
          Hls,
          beaconCollectionDomain: MUX_DATA_CUSTOM_DOMAIN,
          data: {
            env_key: process.env.NEXT_PUBLIC_MUX_ENV_KEY,
            player_name: 'Plyr',
            video_id: playbackId,
            video_title: playbackId,
            player_init_time: playerInitTime,
          },
        });
      }
    }

    return () => {
      if (video) {
        video.removeEventListener('error', videoError);
      }
      if (hls) {
        hls.destroy();
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [playbackId, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (currentTime && video) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <>
      <video ref={metaRef} poster={poster} controls playsInline />
      <style jsx>{`
        :global(:root) {
          --plyr-color-main: #1b1b1b;
          --plyr-range-fill-background: #ccc;
        }
        :global(.plyr) {
          max-height: 100%;
          margin: 0 auto;
          aspect-ratio: ${aspectRatio}
        }
        :global(.plyr__controls button),
        :global(.plyr__controls input) {
          cursor: pointer;
        }
        :global(.plyr:fullscreen video) {
          max-width: initial;
          max-height: initial;
          width: 100%;
          height: 100%;
        }
        video {
          display: block;
          cursor: pointer;
          max-height: 100%;
          max-width: 100%;
        }
        @media only screen and (min-width: ${breakpoints.md}px) {
          :global(.plyr.plyr--full-ui) {
            min-width: 480px;
          }
        }
        @media only screen and (max-width: ${breakpoints.md}px) {
          :global(.plyr__volume, .plyr__menu, .plyr--pip-supported [data-plyr=pip]) {
            display: none;
          }
          video: {
          }
        }
      `}
      </style>
    </>
  );
};

PlyrPlayer.displayName = 'PlyrPlayer';

export default PlyrPlayer;
