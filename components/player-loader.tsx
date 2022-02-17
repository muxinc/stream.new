import { useEffect, forwardRef } from 'react';
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

  useEffect(() => {
    onLoaded();
  }, []);

  return (
    <>
      <div className='video-container'>
        {/* playerType === "plyr" && <PlyrPlayer forwardedRef={ref} isVertical={isVertical} playbackId={playbackId} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} /> */}
      </div>
      <style jsx>{`
        .video-container {
          background: cornflowerblue;
          width: ${isVertical ? 'auto' : '100%'};
          flex-grow: ${isVertical ? 1 : 0};
          flex-shrink: ${isVertical ? 1 : 0};
          aspect-ratio: ${aspectRatio};
          margin-bottom: 40px;
          margin-top: 40px;
          border-radius: 30px;
        }
      `}
      </style>
    </>
  );
});

PlayerLoader.displayName = 'PlayerLoader';

export default PlayerLoader;
