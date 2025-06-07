import { useState, useMemo, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';

import FullpageLoader from './fullpage-loader';
import PlayerLoader from './player-loader';
import Layout from './layout';
import ReportForm from './report-form';
import { 
  HOST_URL, 
  VALID_PLAYER_TYPES,
  PLYR_TYPE,
  MUX_PLAYER_TYPE,
  SUTRO_PLAYER_TYPE,
  WINAMP_PLAYER_TYPE
} from '../constants';
import type { PlayerTypes } from '../constants';
import logger from '../lib/logger';
import { Props } from '../lib/player-page-utils';

type PageProps = Props & {
  playerType: PlayerTypes;
};

const META_TITLE = 'View this video created on stream.new';

const PlayerPage: React.FC<PageProps> = ({ playbackId, videoExists, shareUrl, poster, playerType, blurDataURL, aspectRatio }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [tryToLoadPlayer, setTryToLoadPlayer] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  useEffect(() => {
    if (playerType && !VALID_PLAYER_TYPES.includes(playerType)) {
      setErrorMessage(`Don't know how to load the player called: ${playerType}`);
    }
  }, [playerType]);

  const color = useMemo(() => {
    if (router.query?.color) {
      const val = (router.query?.color as string);
      if (/^[0-9a-fA-F]+$/.test(val)) {
        return `#${val}`;
      } else {
        logger.warn('Invalid color hex value param:', val);
      }
    }
  }, [router.query]);

  const startTime = useMemo(() => {
    return (router.query?.time && parseFloat(router.query.time as string)) || 0;
  }, [router.query]);

  const playerEmbedUrl = useMemo(() => {
    return `${HOST_URL}/v/${playbackId}/embed`;
  }, [playbackId]);

  const playerOptions = [
    { 
      type: MUX_PLAYER_TYPE, 
      name: 'Mux Player (default)', 
      path: `/v/${playbackId}` 
    },
    { 
      type: SUTRO_PLAYER_TYPE, 
      name: 'Sutro', 
      path: `/v/${playbackId}/sutro` 
    },
    { 
      type: PLYR_TYPE, 
      name: 'Plyr', 
      path: `/v/${playbackId}/plyr` 
    },
    { 
      type: WINAMP_PLAYER_TYPE, 
      name: 'Winamp', 
      path: `/v/${playbackId}/winamp` 
    },
  ];

  const switchPlayer = (path: string) => {
    // Preserve query parameters when switching players
    const queryParams = new URLSearchParams();
    if (router.query.time) queryParams.set('time', router.query.time as string);
    if (router.query.color) queryParams.set('color', router.query.color as string);
    
    const queryString = queryParams.toString();
    const newPath = `${path}${queryString ? `?${queryString}` : ''}`;
    router.push(newPath);
  };

  if (router.isFallback || !router.isReady) {
    return (
      <Layout
        metaTitle="View this video created on stream.new"
        image={poster}
        playerEmbedUrl={playerEmbedUrl}
        aspectRatio={aspectRatio}
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
        playerEmbedUrl={playerEmbedUrl}
        aspectRatio={aspectRatio}
        centered={showLoading}
        darkMode
      >
        {showLoading && !tryToLoadPlayer && <FullpageLoader text="Loading player" />}
        <div className="wrapper">
          {(tryToLoadPlayer && aspectRatio && !openReport) && (
            <PlayerLoader
              key={`${playbackId}-${playerType || 'default'}`}
              blurDataURL={blurDataURL}
              color={color}
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
                onClick={() => setShowAdvanced(!showAdvanced)}
                onKeyPress={() => setShowAdvanced(!showAdvanced)}
                role="button"
                tabIndex={0}
                className="advanced"
              >
                Advanced
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
            <div className="advanced-panel">
              {showAdvanced && !openReport && (
                <div className="advanced-options">
                  <div className="player-selection">
                    <span className="label">Player: </span>
                    {playerOptions.map((option, index) => (
                      <span key={option.type}>
                        {option.type === playerType || (option.type === MUX_PLAYER_TYPE && !playerType) ? (
                          <span className="current-player">{option.name}</span>
                        ) : (
                          <a
                            onClick={() => switchPlayer(option.path)}
                            onKeyPress={() => switchPlayer(option.path)}
                            role="button"
                            tabIndex={0}
                            className="player-link"
                          >
                            {option.name}
                          </a>
                        )}
                        {index < playerOptions.length - 1 && <span className="separator"> • </span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
              position: relative;
            }
            .actions a {
              padding-left: 15px;
              padding-right: 15px;
            }
            .advanced-options {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 8px;
              padding: 20px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .player-selection {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 8px;
            }
            .label {
              font-weight: bold;
              color: #fff;
              margin-right: 10px;
            }
            .current-player {
              color: #fff;
              font-weight: bold;
              text-decoration: underline;
            }
            .player-link {
              color: #ccc;
              cursor: pointer;
              text-decoration: none;
            }
            .player-link:hover {
              color: #fff;
              text-decoration: underline;
            }
            .separator {
              color: #666;
            }
            .report-form {
              margin: 20px auto auto;
              max-width: 800px;
            }
            .wrapper {
              display: flex;
              flex-direction: column;
              height: 100%;
              justify-content: center;
            }
            .advanced-panel {
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              z-index: 10;
              margin: 20px auto 0;
              max-width: 800px;
              width: 100%;
            }
            @media (max-width: 600px) {
              .player-selection {
                flex-direction: column;
                align-items: flex-start;
              }
              .label {
                margin-bottom: 10px;
              }
            }
          `}
        </style>
      </Layout>
    </>
  );
};

export default PlayerPage;
