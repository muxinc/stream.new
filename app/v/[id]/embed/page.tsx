'use client';

import { useState, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';

import FullpageLoader from '../../../../components/fullpage-loader';
import PlayerLoader from '../../../../components/player-loader';
import Asterisk from '../../../../components/asterisk';
import { OPEN_SOURCE_URL, MUX_HOME_PAGE_URL } from '../../../../constants';
import { PlayerElement } from '../../../../types';
import logger from '../../../../lib/logger';

interface AsteriskButtonProps {
  onOpenOverlay?: () => void;
}

const AsteriskButton: React.FC<AsteriskButtonProps> = ({ onOpenOverlay }) => {
  return (
    <>
      <a onClick={onOpenOverlay} onKeyPress={onOpenOverlay} role='button' tabIndex={0}>
        <Asterisk size={25} />
      </a>
      <style jsx>{`
        a {
          border-radius: 50%;
          padding: 5px;
          display: flex;
          cursor: pointer;
        }

        a:hover {
          opacity: 0.5;
        }
      `}</style>
    </>
  );
};

export default function PlaybackEmbedded() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoRef = useRef<PlayerElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);

  const playbackId = params.id as string;
  const poster = `https://image.mux.com/${playbackId}/thumbnail.png`;

  const onCloseOverlay = () => {
    setShowOverlay(false);

    if (wasPlaying) {
      videoRef.current?.play();
    }
  };

  const onOpenOverlay = () => {
    setWasPlaying(!videoRef.current?.paused);

    videoRef.current?.pause();

    setShowOverlay(true);
  };

  const nonEmbedUrl = `/v/${playbackId}`;

  const onError = (evt: ErrorEvent) => {
    setErrorMessage('This video does not exist');
    setIsLoaded(false);
    logger.error('Error', evt);
  };

  const showLoading = (!isLoaded && !errorMessage);

  const startTime = searchParams?.get('time') && parseFloat(searchParams.get('time') as string) || 0;

  return (
    <>
      {errorMessage && <h1 className="error-message">{errorMessage}</h1>}
      {showLoading && <FullpageLoader text="Loading player" />}
      <div className="wrapper">
        <PlayerLoader playerType="mux-player" ref={videoRef} playbackId={playbackId} poster={poster} currentTime={startTime} aspectRatio={16/9} onLoaded={() => setIsLoaded(true)} onError={onError} />
        <div className='asterisk-container'>
          <AsteriskButton onOpenOverlay={onOpenOverlay} />
        </div>
        {showOverlay && (
          <div className='overlay-container'>
            <div>
              <p>View this video on <a href={nonEmbedUrl} target='_blank' rel="noreferrer">stream.new</a>
              </p>
              <p>This is an <a href={OPEN_SOURCE_URL}  target='_blank' rel="noreferrer">open source</a> project from <a href={MUX_HOME_PAGE_URL} target='_blank' rel="noreferrer">Mux</a>, the video streaming API.</p>
            </div>
            <p>
              <a onClick={onCloseOverlay} onKeyPress={onCloseOverlay} role='link' tabIndex={0}>
                Close
              </a>
            </p>
          </div>
        )}
      </div>
      <style jsx>{`
        :global(html),
        :global(body) {
          font-family: Akkurat;
        }
        .error-message {
          color: #ccc;
        }
        .asterisk-container {
          position: absolute;
          top: 1.2rem;
          left: 1.2rem;
        }
        .overlay-container {
          padding: 1.25rem;
          background-color: #111;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 200;
        }
        .overlay-container p {
          color: #fff;
          font-family: Akkurat;
          font-size: 1.625rem;
          line-height: 2rem;
        }
        .overlay-container a, .overlay-container a:visited {
          mix-blend-mode: exclusion;
          color: #f8f8f8;
          cursor: pointer;
        }
        :global(mux-player), .overlay-container {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
        }
      `}
      </style>
    </>
  );
}
