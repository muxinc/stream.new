/*
 * Server-first re-creation of the /v/[id]/[playerType] player page for the
 * video.js v10 use cases. NO 'use client' here: the page chrome (Layout) is an
 * existing client component composed with server children, the v10 player is
 * server-rendered directly (the package self-declares 'use client'), and the
 * only app-level client code is the SpikeActions leaf.
 *
 * Deliberate deviations from PlayerPage (for now): no ?time= seek or ?color=
 * params, no onLoaded/FullpageLoader loading state (SSR makes it unnecessary —
 * the player markup is in the initial HTML), errors are left to the skin's own
 * error dialog. (CJP)
 */
import Layout from '../layout';
import SpikeActions from './spike-actions';
import { MUX_DATA_CUSTOM_DOMAIN, VIDEOJS_V10_HLSJS_TYPE } from '../../constants';
import type { Props as PlaybackProps } from '../../lib/player-page-utils';

import '@videojs/react/video/skin.css';
import { VideoPlayer, VideoSkin } from '@videojs/react/video';
import { MuxVideo as MuxVideoSpf } from '@videojs/react/media/mux-video/spf';
import { MuxVideo as MuxVideoHlsjs } from '@videojs/react/media/mux-video/hls-js';
import { MuxData } from '@videojs/react/media/mux-data';

const META_TITLE = 'View this video created on stream.new';

type Props = Omit<PlaybackProps, 'playerType'> & {
  playerType: string;
};

const ServerPlayerPage = ({ playbackId, poster, blurDataURL, aspectRatio, shareUrl, playerType }: Props) => {
  const isHlsjs = playerType === VIDEOJS_V10_HLSJS_TYPE;
  const MuxVideo = isHlsjs ? MuxVideoHlsjs : MuxVideoSpf;

  return (
    <Layout metaTitle={META_TITLE} image={poster} aspectRatio={aspectRatio} darkMode>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        <div style={{ marginTop: 40, marginBottom: 40, height: 0, flexGrow: 1, flexShrink: 1 }}>
          <VideoPlayer>
            <VideoSkin
              poster={poster}
              placeholder={blurDataURL}
              style={{
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
              <MuxVideo
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
                playerSoftwareName={isHlsjs ? 'videojs-v10-hlsjs-rsc' : 'videojs-v10-spf-rsc'}
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
        <SpikeActions playbackId={playbackId} shareUrl={shareUrl} />
      </div>
    </Layout>
  );
};

export default ServerPlayerPage;
