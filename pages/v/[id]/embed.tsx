import { useState, useRef } from 'react';
import { useRouter } from 'next/router';

import FullpageLoader from '../../../components/fullpage-loader';
import VideoPlayer, { HTMLVideoElementWithPlyr } from '../../../components/video-player';
import Layout from '../../../components/layout';
import { Props } from './common';
import Asterisk from '../../../components/asterisk';
export { getStaticProps, getStaticPaths } from './common';
import { OPEN_SOURCE_URL, MUX_HOME_PAGE_URL } from '../../../constants';

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
          background: var(--plyr-video-control-background-hover,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)));
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

const PlaybackEmbedded: React.FC<Props> = ({ playbackId, poster }) => {
  const videoRef = useRef<HTMLVideoElementWithPlyr>(null);
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
    setWasPlaying(videoRef.current?.plyr.playing || false);

    videoRef.current?.pause();

    setShowOverlay(true);
  };

  const url = (typeof window !== 'undefined' && window.location.href) || '';
  const nonEmbedUrl = url.substring(0, url.lastIndexOf('/'));

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
    console.error('Error', evt); // eslint-disable-line no-console
  };

  const showLoading = (!isLoaded && !errorMessage);

  return (
    <>
      {errorMessage && <h1 className="error-message">{errorMessage}</h1>}
      {showLoading && <FullpageLoader text="Loading player" />}
      <div className="wrapper">
        <VideoPlayer ref={videoRef} playbackId={playbackId} poster={poster} onLoaded={() => setIsLoaded(true)} onError={onError} />
        <div className='asterisk-container'>
          <AsteriskButton onOpenOverlay={onOpenOverlay} />
        </div>
        {showOverlay && (
          <div className='overlay-container'>
            <div>
              <p>View this video on <a href={nonEmbedUrl} target='_blank' rel="noreferrer">stream.new</a>
              </p>
              <p>This is an <a href={OPEN_SOURCE_URL}>open source</a> project from <a href={MUX_HOME_PAGE_URL}>Mux</a>, the video streaming API.</p>
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
        .error-message {
          color: #ccc;
        }
        .wrapper :global(video) {
          width: 100%;
          height: 100%;
          max-width: unset;
          max-height: unset;
        }
        .asterisk-container {
          position: absolute;
          top: 1.2rem;
          right: 1.2rem;
        }
        .overlay-container {
          padding: 1.25rem;
          background-color: #111;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
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
        :global(.plyr), .overlay-container {
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
