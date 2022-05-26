import { useState, useRef } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';

import FullpageLoader from '../../../components/fullpage-loader';
import PlayerLoader from '../../../components/player-loader';
import Layout from '../../../components/layout';
import Asterisk from '../../../components/asterisk';
import { OPEN_SOURCE_URL, MUX_HOME_PAGE_URL, HOST_URL } from '../../../constants';
import { PlayerElement } from '../../../types';
import logger from '../../../lib/logger';
import { getImageDimensions } from '../../../lib/image-dimensions';
import { getImageBaseUrl } from '../../../lib/urlutils';

type Params = {
  id: string;
}

export type Props = {
  playbackId: string,
  shareUrl: string,
  poster: string,
  width: number,
  height: number,
  aspectRatio: number,
  videoExists: boolean,
};

export const getStaticProps: GetStaticProps = async (context)  => {
  const { params } = context;
  const { id: playbackId } = (params as Params);
  const poster = `${getImageBaseUrl()}/${playbackId}/thumbnail.png`;
  const shareUrl = `${HOST_URL}/v/${playbackId}`;
  const dimensions = await getImageDimensions(playbackId);

  if (dimensions) {
    return { props: { playbackId, videoExists: true, shareUrl, poster, ...dimensions } };
  } else {
    return { props: { playbackId, videoExists: false } };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};


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

const PlaybackEmbedded: React.FC<Props> = ({ playbackId, poster, aspectRatio }) => {
  const videoRef = useRef<PlayerElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);
  const router = useRouter();

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

  if (router.isFallback) {
    return (
      <Layout
        metaTitle="View this video created on stream.new"
        image={poster}
        centered
        darkMode
      >
        <FullpageLoader text="Loading player..." />;
      </Layout>
    );
  }

  const onError = (evt: ErrorEvent) => {
    setErrorMessage('This video does not exist');
    setIsLoaded(false);
    logger.error('Error', evt);
  };

  const showLoading = (!isLoaded && !errorMessage);

  const startTime = router.query?.time && parseFloat(router.query.time as string) || 0;

  return (
    <>
      {errorMessage && <h1 className="error-message">{errorMessage}</h1>}
      {showLoading && <FullpageLoader text="Loading player" />}
      <div className="wrapper">
        <PlayerLoader playerType="mux-player" ref={videoRef} playbackId={playbackId} poster={poster} currentTime={startTime} aspectRatio={aspectRatio} onLoaded={() => setIsLoaded(true)} onError={onError} />
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
};

export default PlaybackEmbedded;
