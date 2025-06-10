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
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [isMetadataCopied, setIsMetadataCopied] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [viewCountLoading, setViewCountLoading] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);
  const metadataCopyTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (metadataCopyTimeoutRef.current) clearTimeout(metadataCopyTimeoutRef.current);
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

  useEffect(() => {
    if (showAdvanced) {
      fetchViewCount();
    }
  }, [showAdvanced, playbackId]);

  const fetchViewCount = async () => {
    if (!playbackId) return;
    
    console.log('Fetching view count for playback ID:', playbackId);
    setViewCountLoading(true);
    try {
      const response = await fetch(`/api/views/${playbackId}`);
      const data = await response.json();
      console.log('View count API response:', data);
      setViewCount(typeof data.views === 'number' ? data.views : null);
    } catch (error) {
      console.error('Error fetching view count:', error);
      setViewCount(null);
    } finally {
      setViewCountLoading(false);
    }
  };

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

  const fetchMetadata = async () => {
    if (metadata || metadataLoading) return;
    
    setMetadataLoading(true);
    try {
      // Try to get asset data using the playback ID
      const response = await fetch(`/api/assets/by-playback-id/${playbackId}`);
      
      if (response.ok) {
        const data = await response.json();
        setMetadata(data);
      } else {
        // If we can't get the full data, show what we have available client-side
        setMetadata({
          playback_id: playbackId,
          poster: poster,
          share_url: shareUrl,
          aspect_ratio: aspectRatio,
          video_exists: videoExists,
          player_type: playerType || 'mux-player',
          blur_data_url: blurDataURL,
          current_url: window.location.href,
          note: 'Full asset metadata requires API access. This shows client-side data only.'
        });
      }
    } catch (error) {
      logger.error('Error fetching metadata:', error);
      // Show what data we have available
      setMetadata({
        playback_id: playbackId,
        poster: poster,
        share_url: shareUrl,
        aspect_ratio: aspectRatio,
        video_exists: videoExists,
        player_type: playerType || 'mux-player',
        error: 'Could not fetch asset metadata'
      });
    } finally {
      setMetadataLoading(false);
    }
  };

  const toggleMetadata = () => {
    setShowMetadata(!showMetadata);
    if (!showMetadata && !metadata) {
      fetchMetadata();
    }
  };

  const copyMetadata = () => {
    if (metadata) {
      copy(JSON.stringify(metadata, null, 2));
      setIsMetadataCopied(true);
      metadataCopyTimeoutRef.current = window.setTimeout(() => {
        setIsMetadataCopied(false);
        metadataCopyTimeoutRef.current = null;
      }, 2000);
    }
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
        centered
        darkMode
      >
        {showLoading && !tryToLoadPlayer && <FullpageLoader text="Loading player" />}
        <div className="wrapper">
          <div className="content-container">
            <div className="player-section">
              <div className="player-wrapper">
                {!openReport && (
                  <div className="advanced-link-container">
                    <a
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      onKeyPress={() => setShowAdvanced(!showAdvanced)}
                      role="button"
                      tabIndex={0}
                      className="advanced-link"
                    >
                      Advanced
                    </a>
                  </div>
                )}
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
              </div>
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
            </div>
            {showAdvanced && !openReport && (
              <div className="advanced-panel">
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
                  <div className="view-count">
                    <span className="label">Views (7d): </span>
                    {viewCountLoading ? (
                      <span className="loading">Loading...</span>
                    ) : typeof viewCount === 'number' ? (
                      <span className="count">{viewCount.toLocaleString()}</span>
                    ) : (
                      <span className="error">No data</span>
                    )}
                  </div>
                  <div className="metadata-toggle">
                    <a
                      onClick={toggleMetadata}
                      onKeyPress={toggleMetadata}
                      role="button"
                      tabIndex={0}
                      className="metadata-link"
                    >
                      {showMetadata ? 'Hide Metadata' : 'Show Metadata'}
                    </a>
                    {showMetadata && metadata && (
                      <a
                        onClick={copyMetadata}
                        onKeyPress={copyMetadata}
                        role="button"
                        tabIndex={0}
                        className="copy-metadata-link"
                        title="Copy"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="copy-icon"
                        >
                          <path
                            d="M10.5 1.5H3.5C2.67157 1.5 2 2.17157 2 3V11H3.5V3H10.5V1.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12.5 4.5H6.5C5.67157 4.5 5 5.17157 5 6V13C5 13.8284 5.67157 14.5 6.5 14.5H12.5C13.3284 14.5 14 13.8284 14 13V6C14 5.17157 13.3284 4.5 12.5 4.5ZM12.5 13H6.5V6H12.5V13Z"
                            fill="currentColor"
                          />
                        </svg>
                        {isMetadataCopied && <span className="copy-success">Copied!</span>}
                      </a>
                    )}
                  </div>
                  {showMetadata && (
                    <div className="metadata-panel">
                      {metadataLoading ? (
                        <div className="metadata-loading">Loading metadata...</div>
                      ) : metadata ? (
                        <pre className="metadata-content">{JSON.stringify(metadata, null, 2)}</pre>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
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
            .metadata-toggle {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .metadata-link {
              color: #ccc;
              cursor: pointer;
              text-decoration: none;
            }
            .metadata-link:hover {
              color: #fff;
              text-decoration: underline;
            }
            .metadata-panel {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            .copy-metadata-link {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              color: #ccc;
              cursor: pointer;
              padding: 4px 8px;
              border-radius: 4px;
              transition: all 0.2s ease;
            }
            .copy-metadata-link:hover {
              color: #fff;
              background: rgba(255, 255, 255, 0.1);
            }
            .copy-icon {
              width: 16px;
              height: 16px;
              flex-shrink: 0;
            }
            .copy-success {
              font-size: 12px;
              color: #4ade80;
            }
            .metadata-loading {
              color: #ccc;
              font-style: italic;
            }
            .metadata-content {
              background: rgba(0, 0, 0, 0.4);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 4px;
              padding: 15px;
              overflow-x: auto;
              color: #ccc;
              font-family: monospace;
              font-size: 12px;
              line-height: 1.5;
              white-space: pre-wrap;
              word-wrap: break-word;
              max-height: 400px;
              overflow-y: auto;
            }
            .report-form {
              margin: 20px auto auto;
              max-width: 800px;
            }
            .wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              flex-grow: 1;
              width: 100%;
              padding: 20px;
            }
            .content-container {
              display: flex;
              gap: 40px;
              align-items: flex-start;
              justify-content: center;
              width: 100%;
              margin: 0 auto;
            }
            .player-section {
              flex: 0 1 auto;
              display: flex;
              flex-direction: column;
              max-width: min(90vw, calc(100vh - 200px) * 1.78);
              width: 100%;
            }
            .player-wrapper {
              position: relative;
              width: 100%;
            }
            .advanced-link-container {
              position: absolute;
              top: -30px;
              right: 0;
              z-index: 10;
            }
            .advanced-link {
              color: #ccc;
              cursor: pointer;
              text-decoration: none;
              font-size: 14px;
              padding: 5px 10px;
              background: rgba(0, 0, 0, 0.6);
              border-radius: 4px;
              transition: all 0.2s ease;
            }
            .advanced-link:hover {
              color: #fff;
              background: rgba(0, 0, 0, 0.8);
            }
            .advanced-panel {
              flex: 0 0 300px;
              margin-top: 40px;
            }
            .view-count {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .view-count .loading {
              color: #ccc;
              font-style: italic;
            }
            .view-count .count {
              color: #fff;
              font-weight: bold;
            }
            .view-count .error {
              color: #ff6b6b;
            }
            @media (max-width: 900px) {
              .content-container {
                flex-direction: column;
                align-items: center;
              }
              .advanced-panel {
                flex: 0 0 auto;
                width: 100%;
                max-width: 800px;
                margin-top: 20px;
              }
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
