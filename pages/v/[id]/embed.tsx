import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Asterisk from '../../../components/asterisk';
import FullpageLoader from '../../../components/fullpage-loader';
import Layout from '../../../components/layout';

import VideoPlayer from './../../../components/video-player';
import { Props } from './common';
export { getStaticProps, getStaticPaths } from './common';

interface AsteriskButtonProps {
  onClick?: () => void;
}

const AsteriskButton: React.FC<AsteriskButtonProps> = ({ onClick = () => {} }) => {
  return (
    <>
      <a onClick={onClick}>
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

const PlaybackEmbeded: React.FC<Props> = ({ playbackId, poster }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const onError = (evt: ErrorEvent) => {
    setErrorMessage('This video does not exist');
    setIsLoaded(false);
    console.error('Error', evt); // eslint-disable-line no-console
  };

  const renderBody = () => {
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
    else if (errorMessage !== '') {
      return (
        <Layout
          metaTitle="View this video created on stream.new"
          centered
          darkMode
        >
          <h1 className="error-message">{errorMessage}</h1>
          <style jsx>{`
            .error-message {
              color: #ccc;
            }
          `}</style>
        </Layout>
      );
    }
    else {
      return (
        <div className='video-container'>
          <VideoPlayer playbackId={playbackId} poster={poster} onLoaded={() => setIsLoaded(true)} onError={onError} />
          <div className='asterisk-container'>
            <AsteriskButton />
          </div>
          <style jsx>{`
            .video-container {
              font-family: Akkurat;
            }

            .video-container :global(video) {
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
          `}</style>
        </div>
      );
    }
  }

  return <>
    {renderBody()}
    <style jsx>{`
      :global(.plyr) {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
    `}</style>
  </>;
};

export default PlaybackEmbeded;
