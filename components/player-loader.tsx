import { useEffect, forwardRef } from 'react';
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

  useEffect(() => {
    onLoaded();
  }, []);

  return (
    <>
      <div className='video-container'>
        {playerType === "plyr" && <PlyrPlayer forwardedRef={ref} aspectRatio={aspectRatio} playbackId={playbackId} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} />}
      </div>
      <style jsx>{`
        .video-container {
          margin-bottom: 40px;
          margin-top: 40px;
          border-radius: 30px;
          height: 0px;
          aspect-ratio: ${aspectRatio};
          flex-shrink: 1;
          flex-grow: 1;
          object-fit: contain;
        }
      `}
      </style>
    </>
  );
});

PlayerLoader.displayName = 'PlayerLoader';

export default PlayerLoader;
