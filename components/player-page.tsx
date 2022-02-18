import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';

import FullpageLoader from './fullpage-loader';
import PlayerLoader from './player-loader';
import Layout from './layout';
import ReportForm from './report-form';
import { HOST_URL } from '../constants';
import logger from '../lib/logger';
import { Props } from '../lib/player-page-utils';

type PageProps = Props & {
  playerType: string;
};

const META_TITLE = 'View this video created on stream.new';

const Playback: React.FC<PageProps> = ({ playbackId, videoExists, shareUrl, poster, playerType, aspectRatio }) => {
  const isVertical = !!aspectRatio && aspectRatio < 1;
  const [isLoaded, setIsLoaded] = useState(false);
  const [tryToLoadPlayer, setTryToLoadPlayer] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (videoExists === true) {
      setTryToLoadPlayer(true);
    } else if (videoExists === false) {
      setErrorMessage('This video does not exist');
    } else {
      //
      // We don't know if the video exists or not. We're waiting for 'videoExists' prop to get hydrated
      //
    }
  }, [videoExists]);

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
    setErrorMessage('Error loading this video');
    setIsLoaded(false);
    logger.error('Error', evt);
  };

  const showLoading = !isLoaded && !errorMessage;

  const copyUrl = () => {
    copy(shareUrl, { message: 'Copy' });
    setIsCopied(true);
    /*
     * We need a ref to the setTimeout because if the user
     * navigates away before the timeout expires we will
     * clear it out
     */
    copyTimeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
      copyTimeoutRef.current = null;
    }, 5000);
  };

  const startTime =
    (router.query?.time && parseFloat(router.query.time as string)) || 0;

  if (errorMessage) {
    return (
      <Layout darkMode >
        <h1 className="error-message">{errorMessage}</h1>
        <style jsx>
          {`
            .error-message {
              color: #ccc;
            }
          `}
        </style>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/json+oembed"
          href={`${HOST_URL}/api/oembed?url=${encodeURIComponent(`${HOST_URL}/v/${playbackId}`)}`}
          title="video hosted by stream.new"
        />
        <meta name="twitter:player" content={`${HOST_URL}/v/${playbackId}/embed`} />
      </Head>
      <Layout
        metaTitle={META_TITLE}
        image={poster}
        centered={showLoading}
        darkMode
      >
        {showLoading && <FullpageLoader text="Loading player" />}
        <div className="wrapper">
          {(tryToLoadPlayer && aspectRatio && !openReport) && (
            <PlayerLoader
              playbackId={playbackId}
              poster={poster}
              currentTime={startTime}
              aspectRatio={aspectRatio}
              onLoaded={() => setIsLoaded(true)}
              onError={onError}
              playerType={playerType}
            />
          )}
          <div className="actions">
            {!openReport && (
              <a
                onClick={copyUrl}
                onKeyPress={copyUrl}
                role="button"
                tabIndex={0}
              >
                {isCopied ? 'Copied to clipboard' : 'Copy video URL'}
              </a>
            )}
            {!openReport && (
              <a
                onClick={() => setOpenReport(!openReport)}
                onKeyPress={() => setOpenReport(!openReport)}
                role="button"
                tabIndex={0}
                className="report"
              >
                {openReport ? 'Back' : 'Report abuse'}
              </a>
            )}
          </div>
          <div className="report-form">
            {openReport && (
              <ReportForm
                playbackId={playbackId}
                close={() => setOpenReport(false)}
              />
            )}
          </div>
        </div>
        <style jsx>
          {`
            .actions {
              display: flex;
              justify-content: center;
            }
            .actions a {
              padding-left: 15px;
              padding-right: 15px;
            }
            .report-form {
              margin-top: 20px;
            }
            .wrapper {
              display: flex;
              flex-direction: column;
              align-items: ${isVertical ? 'center' : 'stretch'};
              height: 100%;
              justify-content: center;
            }
          `}
        </style>
      </Layout>
    </>
  );
};

    /*
     * .wrapper {
      display: ${isLoaded ? 'flex' : 'none'};
      flex-direction: column;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
      */
export default Playback;
