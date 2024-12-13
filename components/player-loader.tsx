import { ForwardedRef, forwardRef } from 'react';
import { HTMLVideoElementWithPlyr, PlayerElement } from '../types';
import type MuxPlayerElement from '@mux/mux-player';
import { PLYR_TYPE, MUX_PLAYER_TYPE, MUX_PLAYER_CLASSIC_TYPE, MUX_VIDEO_TYPE, WINAMP_PLAYER_TYPE } from '../constants';
import dynamic from 'next/dynamic';
import Script from 'next/script';

/*
 * It is important for these to be loaded with next/dynamic so that we don't load all
 * the javascript for every single possible player.
 *
 * Lucky for us, next/dynamic will handle the code splitting and not load code for components
 * that we don't end up using.
 */
const PlyrPlayer = dynamic(() => import('./plyr-player'));
const MuxPlayer = dynamic(() => import('./mux-player'));
const MuxPlayerClassic = dynamic(() => import('./mux-player-classic'));
const MuxVideo = dynamic(() => import('./mux-video'));
const WinampPlayer = dynamic(() => import('./winamp-player'));

type Props = {
  blurDataURL?: string;
  playbackId: string;
  poster: string;
  color?: string;
  currentTime?: number
  aspectRatio: number;
  onLoaded: () => void;
  playerType: string;
  onError: (error: ErrorEvent) => void;
};



const PlayerLoader = forwardRef<PlayerElement, Props>(({ playbackId, poster, currentTime, aspectRatio, playerType, color, blurDataURL, onLoaded, onError }, ref) => {
  const isAMuxPlayer = () => [MUX_PLAYER_CLASSIC_TYPE, MUX_PLAYER_TYPE].includes(playerType);

  return (
    <>
      <div className='video-container'>
        {playerType === PLYR_TYPE && <PlyrPlayer forwardedRef={ref as ForwardedRef<HTMLVideoElementWithPlyr>} aspectRatio={aspectRatio} playbackId={playbackId} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} />}
        {playerType === MUX_PLAYER_TYPE && <MuxPlayer forwardedRef={ref as ForwardedRef<MuxPlayerElement>} playbackId={playbackId} aspectRatio={aspectRatio} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} blurDataURL={blurDataURL} color={color} />}
        {playerType === MUX_PLAYER_CLASSIC_TYPE && <MuxPlayerClassic forwardedRef={ref as ForwardedRef<MuxPlayerElement>} playbackId={playbackId} aspectRatio={aspectRatio} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} blurDataURL={blurDataURL} color={color} />}
        {playerType === MUX_VIDEO_TYPE && <MuxVideo playbackId={playbackId} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} />}
        {playerType === WINAMP_PLAYER_TYPE && <WinampPlayer playbackId={playbackId} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} />}
      </div>
      <style jsx>{`
        .video-container {
          margin-bottom: 40px;
          margin-top: 40px;
          border-radius: 30px;
          height: 0;
          flex-shrink: 1;
          flex-grow: 1;
        }
      `}
      </style>
      {isAMuxPlayer() && <Script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1" />}
    </>
  );
});

PlayerLoader.displayName = 'PlayerLoader';

export default PlayerLoader;
