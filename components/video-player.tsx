/* globals Image */
import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import mux from 'mux-embed';
import logger from '../lib/logger';
import { breakpoints } from '../style-vars';

/*
 * We need to set the width/height of the player depending on what the dimensions of
 * the underlying video source is.
 *
 * On most platforms we know the dimensions on 'loadedmetadata'
 * On Desktop Safari we don't know the dimensions until 'canplay'
 *
 * At first, I tried to get the dimensions of the video from these callbacks, that worked
 * great except for on moble Safari. On Mobile Safari none of those callbacks fire until
 * there is some user interaction :(
 *
 * BUT! There is a brilliant hack here. We can create a `display: none` `img` element in the
 * DOM, load up the poster image.
 *
 * Since the poster image will have the same dimensions of the video, now we know if the video
 * is vertical and now we can style the proper width/height so the layout doesn't have a sudden
 * jump or resize.
 *
 */

type Props = {
  playbackId: string
  poster: string
  onLoaded: () => void
  onError: (error: ErrorEvent) => void
};

type SizedEvent = {
  target: {
    width: number
    height: number
  }
};

const VideoPlayer: React.FC<Props> = ({ playbackId, poster, onLoaded, onError }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVertical, setIsVertical] = useState<boolean | null>();
  const [playerInitTime] = useState(Date.now());

  const videoError = (event: ErrorEvent) => onError(event);

  const onImageLoad = (event: SizedEvent) => {
    const [w, h] = [event.target.width, event.target.height];
    if (w && h) {
      setIsVertical((w / h) < 1);
      onLoaded();
    } else {
      onLoaded();
      console.error('Error getting img dimensions', event); // eslint-disable-line no-console
    }
  };

  /*
   * See comment above -- we're loading the poster image just so we can grab the dimensions
   * which determines styles for the player
   */
  useEffect(() => {
    const img = new Image();
    img.onload = (evt) => onImageLoad((evt as unknown) as SizedEvent);
    img.src = poster;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const src = `https://stream.mux.com/${playbackId}.m3u8`;
    let hls: Hls | null;
    hls = null;
    if (video) {
      video.addEventListener('error', videoError);

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
          data: {
            env_key: process.env.NEXT_PUBLIC_MUX_ENV_KEY,

            player_name: 'hls.js player v1',
            video_id: playbackId,
            video_title: playbackId,
            video_stream_type: 'on-demand',
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
    };
  }, [playbackId, videoRef]);

  return (
    <>
      <video ref={videoRef} poster={poster} controls />
      <style jsx>{`
        video {
          display: block;
          width: ${isVertical ? 'auto' : '1000px'};
          height: ${isVertical ? '600px' : 'auto'};
          max-width: 100%;
          max-height: 50vh;
          cursor: pointer;
          margin-top: 40px;
          margin-bottom: 40px;
          border-radius: 30px;
        }
        @media only screen and (min-width: ${breakpoints.md}px) {
          video {
            max-height: 70vh;
          }
        }
      `}
      </style>
    </>
  );
};

export default VideoPlayer;
