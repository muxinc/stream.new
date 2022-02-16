import { forwardRef } from 'react';
import { breakpoints } from '../style-vars';
import { HTMLVideoElementWithPlyr } from '../types';
import dynamic from 'next/dynamic';

const PlyrPlayer = dynamic(() => import('./plyr-player'));

type Props = {
  playbackId: string
  poster: string
  currentTime?: number
  aspectRatio: number;
  onLoaded: () => void;
  playerType: string;
  onError: (error: ErrorEvent) => void;
};

const PlayerLoader = forwardRef<HTMLVideoElementWithPlyr, Props>(({ playbackId, poster, currentTime, aspectRatio, playerType, onLoaded, onError }, ref) => {
  const isVertical = aspectRatio < 1;

  return (
    <>
      <div className='video-container'>
        {playerType === "plyr" && <PlyrPlayer forwardedRef={ref} isVertical={isVertical} playbackId={playbackId} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} /> }
      </div>
      <style jsx>{`
        .video-container {
          margin-bottom: 40px;
          margin-top: 40px;
          border-radius: 30px;
        }
        :global(.plyr:fullscreen video) {
          max-width: initial;
          max-height: initial;
          width: 100%;
          height: 100%;
        }
        video {
          display: block;
          max-width: 100%;
          max-height: 50vh;
          cursor: pointer;
        }
        @media only screen and (min-width: ${breakpoints.md}px) {
          video {
            width: ${isVertical ? 'auto' : '1000px'};
            height: ${isVertical ? '600px' : 'auto'};
            max-height: 70vh;
            min-width: 30rem;
          }
        }
        @media only screen and (max-width: ${breakpoints.md}px) {
          :global(.plyr__volume, .plyr__menu, .plyr--pip-supported [data-plyr=pip]) {
            display: none;
          }
          video: {
            width: 100%;
            height: 100%;
          }
        }
      `}
      </style>
    </>
  );
});

PlayerLoader.displayName = 'PlayerLoader';

export default PlayerLoader;
