import { ForwardedRef, forwardRef } from 'react';
import { HTMLVideoElementWithPlyr, PlayerElement } from '../types';
import type MuxPlayerElement from '@mux/mux-player';
import {
  PLYR_TYPE,
  MUX_VIDEO_TYPE,
  MUX_PLAYER_TYPE,
  MUX_PLAYER_CLASSIC_TYPE,
  WINAMP_PLAYER_TYPE,
  VIDEOJS_V10_SPF_TYPE,
  VIDEOJS_V10_HLSJS_TYPE,
} from '../constants';
import dynamic from 'next/dynamic';
import Script from 'next/script';

/*
 * It is important for these to be loaded with next/dynamic so that we don't load all
 * the javascript for every single possible player.
 *
 * Lucky for us, next/dynamic will handle the code splitting and not load code for components
 * that we don't end up using.
 */
const PlyrPlayer = dynamic(() => import('./plyr-player'), { ssr: false });
const MuxVideo = dynamic(() => import('./mux-video'));
const MuxPlayer = dynamic(() => import('./mux-player'));
const MuxPlayerClassic = dynamic(() => import('./mux-player-classic'));
const WinampPlayer = dynamic(() => import('./winamp-player'));
const VideojsV10Spf = dynamic(() => import('./videojs-v10-spf'));
const VideojsV10Hlsjs = dynamic(() => import('./videojs-v10-hlsjs'));

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

  /*
   * Reserves the correctly-sized layout box for the video.js v10 players; their skin
   * fills it (width/height 100%). Keeping the sizing here (rather than on the skin)
   * means the box exists as soon as PlayerLoader renders, so a slow-mounting player
   * can't cause a layout shift. NOTE: These players must NOT be loaded with
   * { ssr: false } — client-only loading defers the chunk past hydration, which
   * paints the page's 'centered loading' layout and causes a large CLS when the
   * player finally mounts (measured ~1.4; ~0.02 without ssr: false). (CJP)
   */
  const videojsV10SizingStyle: React.CSSProperties = {
    aspectRatio: `${aspectRatio}`,
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    height: '100%',
  };

  return (
    <>
      <div className='video-container'>
        {playerType === PLYR_TYPE && <PlyrPlayer forwardedRef={ref as ForwardedRef<HTMLVideoElementWithPlyr>} aspectRatio={aspectRatio} playbackId={playbackId} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} />}
        {playerType === MUX_VIDEO_TYPE && <MuxVideo playbackId={playbackId} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} />}
        {playerType === MUX_PLAYER_TYPE && <MuxPlayer forwardedRef={ref as ForwardedRef<MuxPlayerElement>} playbackId={playbackId} aspectRatio={aspectRatio} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} blurDataURL={blurDataURL} color={color} />}
        {playerType === MUX_PLAYER_CLASSIC_TYPE && <MuxPlayerClassic forwardedRef={ref as ForwardedRef<MuxPlayerElement>} playbackId={playbackId} aspectRatio={aspectRatio} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} blurDataURL={blurDataURL} color={color} />}
        {playerType === WINAMP_PLAYER_TYPE && <WinampPlayer playbackId={playbackId} poster={poster} currentTime={currentTime} onLoaded={onLoaded} onError={onError} />}
        {playerType === VIDEOJS_V10_SPF_TYPE && <div style={videojsV10SizingStyle}><VideojsV10Spf playbackId={playbackId} poster={poster} currentTime={currentTime} blurDataURL={blurDataURL} onLoaded={onLoaded} onError={onError} /></div>}
        {playerType === VIDEOJS_V10_HLSJS_TYPE && <div style={videojsV10SizingStyle}><VideojsV10Hlsjs playbackId={playbackId} poster={poster} currentTime={currentTime} blurDataURL={blurDataURL} onLoaded={onLoaded} onError={onError} /></div>}
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
