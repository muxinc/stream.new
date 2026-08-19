/*
 * Server-first player page for the video.js v10 use cases, used by /v/[id] and
 * /v/[id]/[playerType] for the videojs-v10-* player types.
 *
 * NO 'use client' here: the page chrome (Layout) is an existing client
 * component composed with server children, the v10 player is
 * server-rendered directly (the package self-declares 'use client'), and the
 * only app-level client code is the PlayerActions leaf.
 *
 * Deliberate deviations from PlayerPage (for now): no ?time= seek param,
 * no onLoaded/FullpageLoader loading state (SSR makes it unnecessary —
 * the player markup is in the initial HTML), errors are left to the skin's own
 * error dialog, and opening the report form doesn't unmount the player. (CJP)
 */
import Layout from './layout';
import PlayerActions from './player-actions';
import { MUX_DATA_CUSTOM_DOMAIN } from '../constants';
import { toCssUnquotedUrlSafe } from '../lib/css-url';
import type { Props as PlaybackProps } from '../lib/player-page-utils';
import type { VideojsV10Engine } from '../lib/videojs-v10-engine';

import '@videojs/react/video/skin.css';
import { VideoPlayer, VideoSkin } from '@videojs/react/video';
import { MuxData } from '@videojs/react/media/mux-data';
import VideojsV10Media from './videojs-v10-media';

const META_TITLE = 'View this video created on stream.new';

type Props = Omit<PlaybackProps, 'playerType'> & {
  playerType: string;
  engine: VideojsV10Engine;
  color?: string;
};

const VideojsV10PlayerPage = ({ playbackId, poster, blurDataURL, aspectRatio, shareUrl, playerType, engine, color }: Props) => {
  const isHlsjs = engine === 'hlsjs';

  return (
    <Layout metaTitle={META_TITLE} image={poster} aspectRatio={aspectRatio} darkMode>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        <div style={{ marginTop: 40, marginBottom: 40, height: 0, flexGrow: 1, flexShrink: 1 }}>
          <VideoPlayer>
            <VideoSkin
              poster={poster}
              placeholder={blurDataURL && toCssUnquotedUrlSafe(blurDataURL)}
              style={{
                '--media-accent-color': color,
                aspectRatio: `${aspectRatio}`,
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                height: '100%',
              }}
            >
              <VideojsV10Media
                engine={engine}
                source={{
                  playbackId,
                  customDomain: process.env.NEXT_PUBLIC_MUX_BYO_DOMAIN || undefined,
                }}
                crossOrigin="anonymous"
                streamType="on-demand"
                preload="metadata"
                playsInline
              />
              <MuxData
                beaconCollectionDomain={MUX_DATA_CUSTOM_DOMAIN}
                envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
                playerSoftwareName={`${playerType}-rsc`}
                metadata={{
                  video_id: playbackId,
                  video_title: playbackId,
                  player_name: isHlsjs
                    ? 'video.js v10 (hls.js-backed MuxVideo, RSC)'
                    : 'video.js v10 (SPF-backed MuxVideo, RSC)',
                }}
              />
            </VideoSkin>
          </VideoPlayer>
        </div>
        <PlayerActions playbackId={playbackId} shareUrl={shareUrl} />
      </div>
    </Layout>
  );
};

export default VideojsV10PlayerPage;
