import { useEffect } from 'react';
import MuxVideo from '@mux/mux-video-react';
import { MUX_DATA_CUSTOM_DOMAIN } from '../constants';

import {
  MediaController,
  MediaSeekBackwardButton,
  MediaPlayButton,
  MediaSeekForwardButton,
  MediaFullscreenButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
  MediaCaptionsButton,
} from 'media-chrome/dist/react';

type Props = {
  playbackId: string;
  poster: string;
  currentTime?: number;
  onLoaded: () => void;
  onError: (error: ErrorEvent) => void;
};

const WinampPlayer: React.FC<Props> = ({
  playbackId,
  poster,
  currentTime,
  onLoaded,
}) => {
  useEffect(() => {
    onLoaded();
  }, []);

  return (
    <>
      <div className="winamp-player">
        <div className="wrapper">
          <div className="controls">
            <MediaSeekBackwardButton
              mediaController="controller"
              className="media-seek-backward-button"
            >
              <div slot="icon"></div>
            </MediaSeekBackwardButton>
            <MediaPlayButton className="play" mediaController="controller">
              <div slot="play"></div>
              <div slot="pause"></div>
            </MediaPlayButton>
            <MediaPlayButton className="pause" mediaController="controller">
              <div slot="play"></div>
              <div slot="pause"></div>
            </MediaPlayButton>
            <MediaPlayButton className="stop" mediaController="controller">
              <div slot="play"></div>
              <div slot="pause"></div>
            </MediaPlayButton>
            <MediaSeekForwardButton mediaController="controller">
              <div slot="icon"></div>
            </MediaSeekForwardButton>
            <MediaFullscreenButton mediaController="controller">
              <div slot="enter"></div>
            </MediaFullscreenButton>
          </div>
          <MediaTimeDisplay mediaController="controller"></MediaTimeDisplay>
          <MediaTimeRange mediaController="controller"></MediaTimeRange>
          <MediaVolumeRange mediaController="controller"></MediaVolumeRange>
          <div className="titlebar"></div>
          <div className="display"></div>
          <div className="eq"></div>
          <div className="pl"></div>
          <div className="loop"></div>
          <MediaCaptionsButton mediaController="controller">
            <div slot="on"></div>
            <div slot="off"></div>
          </MediaCaptionsButton>
          <div className="balance"></div>
          <div className="monoster">
            <div></div>
            <div></div>
          </div>
          {/* eslint-disable */}
          {/* @ts-ignore */}
          <marquee scrolldelay="200">Media Chrome, it really whips the llama&apos;s ass!</marquee>
          {/* eslint-enable */}
          <div className="kbps">192</div>
          <div className="khz">44</div>
          <MediaPlayButton
            mediaController="controller"
            className="play-pause-indicator"
          >
            <div slot="play"></div>
            <div slot="pause"></div>
          </MediaPlayButton>
          <MediaPlayButton mediaController="controller" className="vu-meter">
            <div slot="play"></div>
            <div slot="pause"></div>
          </MediaPlayButton>
        </div>

        <div className="window">
          <div className="top">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="center">
            <div className="center-left"></div>
            <div className="center-middle">
              <div
                style={{ width: '100%', height: '100%', background: 'green' }}
              >
                <MediaController id="controller">
                  {/* Followup: Figure out why TS error occurs here but not in demo nextjs app (CJP) */}
                  {/* eslint-disable */}
                  {/* @ts-ignore */}
                  <MuxVideo
                    slot="media"
                    beaconCollectionDomain={MUX_DATA_CUSTOM_DOMAIN}
                    playbackId={playbackId}
                    poster={poster}
                    startTime={currentTime}
                    envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
                    streamType="on-demand"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'block',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                    metadata={{
                      video_id: playbackId,
                      video_title: playbackId,
                      player_name: 'Winamp player',
                    }}
                  />
                  {/* eslint-enable */}
                </MediaController>
              </div>
            </div>
            <div className="center-right"></div>
          </div>
          <div className="bottom"></div>
        </div>
      </div>
      <style jsx>
        {`
          :global(:root) {
            --media-range-background: transparent;

            --media-range-track-height: 1px;
            --media-range-track-background: transparent;

            --media-preview-time-background: transparent;
            --media-preview-time-margin: 0;
            --media-preview-time-padding: 0;

            image-rendering: pixelated;
          }
          .video-container {
          }
          .winamp-player {
            transform-origin: top center;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }
          @media (min-width: 415px) {
            .winamp-player {
              transform: scale(1.25);
            }
          }
          @media (min-width: 500px) {
            .winamp-player {
              transform: scale(1.5);
            }
          }
          @media (min-width: 768px) {
            .winamp-player {
              transform: scale(2);
            }
          }
          .winamp-player :global(media-time-range),
          .winamp-player :global(media-time-range:active),
          .winamp-player :global(media-time-range:hover) {
            --media-range-thumb-width: 28px;
            --media-range-thumb-height: 10px;
            --media-range-thumb-border-radius: 0;
            --media-range-thumb-background: 58px 0
              url(/winamp-player/POSBAR.BMP);
          }

          .winamp-player :global(media-time-range),
          .winamp-player :global(media-time-range:active),
          .winamp-player :global(media-time-range:hover) {
            --media-range-thumb-width: 28px;
            --media-range-thumb-height: 10px;
            --media-range-thumb-border-radius: 0;
            --media-range-thumb-background: 58px 0
              url(/winamp-player/POSBAR.BMP);
          }

          .winamp-player :global(media-volume-range),
          .winamp-player :global(media-volume-range:active),
          .winamp-player :global(media-volume-range:hover) {
            --media-range-thumb-width: 14px;
            --media-range-thumb-height: 10px;
            --media-range-thumb-border-radius: 0;
            --media-range-thumb-background: 53px 443px
              url(/winamp-player/BALANCE.BMP);
            --media-range-bar-color: transparent;
          }

          @font-face {
            font-family: winamp-numbers;
            src: url('/winamp-player/winamp-numbers.ttf') format('truetype');
          }

          @font-face {
            font-family: winamp;
            src: url('/winamp-player/winamp.ttf') format('truetype');
          }

          .wrapper {
            position: relative;
            width: 275px;
            height: 116px;
            background: url(/winamp-player/MAIN.BMP);
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
          }

          .controls {
            position: absolute;
            top: 88px;
            left: 16px;
            display: flex;
          }

          .winamp-player :global(media-seek-backward-button) {
            display: block;
            overflow: hidden;
            padding: 0;
            width: 23px;
            height: 18px;
          }

          .winamp-player
            :global(media-seek-backward-button div[slot='icon']) {
            width: 23px;
            height: 18px;
            background: 136px 0 url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player
            :global(media-seek-backward-button:active div[slot='icon']) {
            width: 23px;
            height: 18px;
            background: 136px 18px url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player :global(media-play-button) {
            display: block;
            overflow: hidden;
            padding: 0;
            width: 23px;
            height: 18px;
          }

          .winamp-player :global(media-play-button.play div[slot='play']) {
            width: 23px;
            height: 18px;
            background: 114px 0 url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player :global(media-play-button.play div[slot='pause']) {
            width: 23px;
            height: 18px;
            background: 114px 0 url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player
            :global(media-play-button.play:active div[slot='play']) {
            width: 23px;
            height: 18px;
            background: 114px 18px url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player
            :global(media-play-button.play:active div[slot='pause']) {
            width: 23px;
            height: 18px;
            background: 114px 18px url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player :global(media-play-button.pause div[slot='pause']) {
            width: 23px;
            height: 18px;
            background: 91px 0 url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player :global(media-play-button.pause div[slot='play']) {
            width: 23px;
            height: 18px;
            background: 91px 0 url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player
            :global(media-play-button.pause:active div[slot='play']) {
            width: 23px;
            height: 18px;
            background: 91px 18px url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player
            :global(media-play-button.pause:active div[slot='pause']) {
            width: 23px;
            height: 18px;
            background: 91px 18px url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player :global(media-play-button.stop div[slot='pause']) {
            width: 23px;
            height: 18px;
            background: 68px 0 url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player :global(media-play-button.stop div[slot='play']) {
            width: 23px;
            height: 18px;
            background: 68px 0 url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player
            :global(media-play-button.stop:active div[slot='play']) {
            width: 23px;
            height: 18px;
            background: 68px 18px url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player
            :global(media-play-button.stop:active div[slot='pause']) {
            width: 23px;
            height: 18px;
            background: 68px 18px url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player :global(media-seek-forward-button) {
            display: block;
            overflow: hidden;
            padding: 0;
            width: 23px;
            height: 18px;
          }

          .winamp-player
            :global(media-seek-forward-button div[slot='icon']) {
            width: 23px;
            height: 18px;
            background: 45px 0 url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player
            :global(media-seek-forward-button:active div[slot='icon']) {
            width: 23px;
            height: 18px;
            background: 45px 18px url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player :global(media-fullscreen-button) {
            display: block;
            overflow: hidden;
            padding: 0;
            margin-top: 1px;
            margin-left: 6px;
            width: 22px;
            height: 16px;
          }

          .winamp-player :global(media-fullscreen-button div[slot='enter']) {
            width: 23px;
            height: 16px;
            background: 22px 0 url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player
            :global(media-fullscreen-button:active div[slot='enter']) {
            width: 23px;
            height: 16px;
            background: 22px 20px url(/winamp-player/CBUTTONS.BMP);
          }

          .winamp-player :global(media-time-display) {
            position: absolute;
            background: black;
            line-height: 20px;
            top: 23px;
            left: 61px;
            padding: 0;
            color: #00e201;
            letter-spacing: -0.04rem;
            font-family: 'winamp-numbers';
            font-size: 83%;
            font-smooth: never;
            -webkit-font-smoothing: none;
          }

          .winamp-player :global(media-time-range) {
            position: absolute;
            top: 71px;
            left: 17px;
            background: transparent;
            height: 12px;
            width: 248px;
            padding: 0;
          }

          .winamp-player :global(media-time-range::part(preview-box)) {
            display: none;
          }

          .winamp-player :global(media-volume-range) {
            position: absolute;
            top: 58px;
            left: 108px;
            background: 0 -2px url(/winamp-player/VOLUME.BMP);
            height: 10px;
            width: 68px;
            padding: 0;
          }

          .balance {
            position: absolute;
            top: 58px;
            left: 177px;
            background: -9px -2px url(/winamp-player/BALANCE.BMP);
            height: 10px;
            width: 37px;
            padding: 0;
          }

          .monoster {
            position: absolute;
            left: 215px;
            top: 40px;
            width: 50px;
            height: 15px;
            display: flex;
          }

          .monoster div:first-child {
            width: 24px;
            height: 13px;
            background: 24px 13px url(/winamp-player/MONOSTER.BMP);
          }

          .monoster div:last-child {
            width: 26px;
            height: 13px;
            background: 0px 25px url(/winamp-player/MONOSTER.BMP);
          }

          marquee {
            position: absolute;
            left: 111px;
            top: 27px;
            width: 153px;
            letter-spacing: 0.02rem;
            font-family: winamp;
            font-size: 6px;
            color: #00e201;
            font-smooth: never;
            -webkit-font-smoothing: none;
            text-transform: uppercase;
          }

          .kbps {
            position: absolute;
            left: 111px;
            top: 43px;
            width: 153px;
            letter-spacing: 0.02rem;
            font-family: winamp;
            font-size: 6px;
            color: #00e201;
            font-smooth: never;
            -webkit-font-smoothing: none;
          }

          .khz {
            position: absolute;
            left: 156px;
            top: 43px;
            width: 153px;
            letter-spacing: 0.02rem;
            font-family: winamp;
            font-size: 6px;
            color: #00e201;
            font-smooth: never;
            -webkit-font-smoothing: none;
          }

          .winamp-player :global(media-play-button.play-pause-indicator) {
            display: block;
            overflow: hidden;
            background: none;
            position: absolute;
            top: 28px;
            left: 24px;
            padding: 0;
            width: 9px;
            height: 9px;
          }

          .winamp-player
            :global(media-play-button.play-pause-indicator div[slot='play']) {
            width: 9px;
            height: 9px;
            background: -18px 0 url(/winamp-player/PLAYPAUS.BMP);
          }

          .winamp-player
            :global(media-play-button.play-pause-indicator div[slot='pause']) {
            width: 9px;
            height: 9px;
            background: 0 0 url(/winamp-player/PLAYPAUS.BMP);
          }

          .winamp-player :global(media-play-button.vu-meter) {
            display: block;
            overflow: hidden;
            background: none;
            position: absolute;
            top: 40px;
            left: 20px;
            padding: 0;
            width: 88px;
            height: 22px;
          }

          .winamp-player :global(media-play-button.vu-meter div[slot='play']) {
            width: 88px;
            height: 22px;
            background: none;
          }

          .winamp-player :global(media-play-button.vu-meter div[slot='pause']) {
            width: 88px;
            height: 22px;
            background: 0 0 url(/winamp-player/VU.gif);
          }

          .display {
            position: absolute;
            left: 10px;
            top: 22px;
            width: 8px;
            height: 43px;
            background-image: url(/winamp-player/TITLEBAR.BMP);
            background-position: -304px 0;
          }

          .eq {
            position: absolute;
            left: 220px;
            top: 57px;
            width: 22px;
            height: 12px;
            background-image: url(/winamp-player/SHUFREP.BMP);
            background-position: 0 -73px;
          }

          .pl {
            position: absolute;
            left: 243px;
            top: 57px;
            width: 22px;
            height: 12px;
            background-image: url(/winamp-player/SHUFREP.BMP);
            background-position: -23px -73px;
          }

          .loop {
            position: absolute;
            left: 211px;
            top: 89px;
            width: 28px;
            height: 14px;
            background-image: url(/winamp-player/SHUFREP.BMP);
          }

          .winamp-player :global(media-captions-button) {
            position: absolute;
            left: 165px;
            top: 89px;
            width: 46px;
            height: 14px;
            padding: 0;
            overflow: hidden;
          }

          .winamp-player :global(media-captions-button div[slot='on']),
          .winamp-player :global(media-captions-button div[slot='off']) {
            width: 46px;
            height: 14px;
            background-image: url(/winamp-player/SHUFREP.BMP);
            background-position: -29px 0;
          }

          .window {
            width: 275px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .window .top,
          .window .bottom {
            width: 100%;
            height: 20px;
            flex: none;
            display: flex;
            flex: none;
          }

          .window .top div:nth-child(1) {
            width: 25px;
            height: 20px;
            flex: none;
            background-image: url(/winamp-player/WINDOWTL.png);
          }

          .window .top div:nth-child(2) {
            height: 20px;
            width: 100%;
            flex-grow: 1;
            background-image: url(/winamp-player/WINDOWT.png);
            background-repeat: no-repeat;
          }

          .window .top div:nth-child(3) {
            width: 25px;
            height: 20px;
            flex: none;
            background-image: url(/winamp-player/WINDOWTR.png);
          }

          .titlebar {
            width: 100%;
            height: 14px;
            background-image: url(/winamp-player/TITLEBAR.BMP);
            background-position: -27px 0;
          }

          .window .bottom {
            width: 100%;
            background-image: url(/winamp-player/GEN.BMP),
              url(/winamp-player/GEN.BMP);
            background-position: 150px -57px, 0 -42px;
            background-repeat: no-repeat, no-repeat;
            height: 13px;
            position: relative;
          }

          .window .bottom:before {
            content: '';
            position: absolute;
            left: 125px;
            top: 0;
            width: 25px;
            height: 100%;
            z-index: 1;
            background-image: url(/winamp-player/GEN.BMP);
            background-position: -127px -72px;
            background-repeat: no-repeat;
          }

          .window .center {
            width: 100%;
            height: 108px;
            display: flex;
          }

          .window .center .center-left {
            width: 11px;
            height: 100%;
            flex: none;
            background-image: url(/winamp-player/WINDOWL.png);
            background-repeat: no-repeat;
            background-position: 0 0;
          }

          .window .center .center-middle {
            width: 100%;
            height: 100%;
            flex-grow: 1;
            overflow: hidden;
          }

          .window .center .center-middle :global(media-controller) {
            display: block;
            width: 100%;
            height: 100%;
            background: black;
            transform: scale(1.35);
          }

          .window .center .center-right {
            width: 8px;
            height: 100%;
            flex: none;
            background-image: url(/winamp-player/WINDOWR.png);
          }
        `}
      </style>
    </>
  );
};

WinampPlayer.displayName = 'WinampPlayer';

export default WinampPlayer;
