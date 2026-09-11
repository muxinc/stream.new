/*
 * Server-first player page for the video.js v10 use cases, used by /v/[id] and
 * /v/[id]/[playerType] for the videojs-v10-* player types.
 *
 * NO 'use client' here: the page chrome (Layout) is an existing client
 * component composed with server children, the v10 player is
 * server-rendered directly (the package self-declares 'use client'), and the
 * only app-level client code is the PlayerActions leaf.
 *
 * Deliberate deviations from PlayerPage (for now):
 * no onLoaded/FullpageLoader loading state (SSR makes it unnecessary —
 * the player markup is in the initial HTML), errors are left to the skin's own
 * error dialog, and opening the report form doesn't unmount the player. (CJP)
 */
import Layout from './layout';
import PlayerActions from './player-actions';
import { MUX_DATA_CUSTOM_DOMAIN, DEFAULT_PLAYER_ASPECT_RATIO } from '../constants';
import { toCssUnquotedUrlSafe } from '../lib/css-url';
import type { Props as PlaybackProps } from '../lib/player-page-utils';
import type { VideojsV10Engine } from '../lib/videojs-v10-engine';

import '@videojs/react/video/skin.css';
import { VideoPlayer, VideoSkin } from '@videojs/react/video';
import { MuxData } from '@videojs/react/extensions/mux-data';
import VideojsV10Media from './videojs-v10-media';
import PerfMarks from './perf-marks';

const META_TITLE = 'View this video created on stream.new';

type Props = Omit<PlaybackProps, 'playerType'> & {
  playerType: string;
  engine: VideojsV10Engine;
  color?: string;
  startTime?: number; // ?time= (see VideojsV10Media)
  // Testing affordances (?autoplay, ?preload=, ?perf) — see the integration
  // notes' A/B methodology section. (CJP)
  autoplay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  perf?: boolean;
};

/*
 * Mux Data `player_software_name`, derived from the import path of the media
 * component in use (façade + media + engine), mirroring how Mux Player reports
 * its package name (`mux-player-react`). The v10 extension has no default of
 * its own (v10 friction log item 9); the version is left to the library default.
 * Render path / engine / stream.new player type bisecting belongs in Mux Data
 * custom dimensions (follow-up), not in this name. (CJP)
 */
const PLAYER_SOFTWARE_NAME: Record<VideojsV10Engine, string> = {
  hlsjs: 'videojs-react-mux-video-hls-js',
  spf: 'videojs-react-mux-video-spf',
};

const VideojsV10PlayerPage = ({ playbackId, poster, blurDataURL, aspectRatio = DEFAULT_PLAYER_ASPECT_RATIO, shareUrl, engine, color, startTime, autoplay, preload, perf }: Props) => {

  return (
    <Layout metaTitle={META_TITLE} image={poster} aspectRatio={aspectRatio} darkMode>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        <div style={{ marginTop: 40, marginBottom: 40, height: 0, flexGrow: 1, flexShrink: 1 }}>
          <VideoPlayer poster={poster}>
            <VideoSkin
              // rc.2: the skin's `placeholder` prop is gone; the blurup goes on
              // the poster <img> as a background via `renderPoster`. The element
              // form (not a function) keeps this passable from a server
              // component. Same fit as the skin's object-fit so the two images
              // don't jump when the poster arrives. (CJP)
              renderPoster={
                blurDataURL ? (
                  <img
                    alt=""
                    style={{
                      background: `url(${toCssUnquotedUrlSafe(blurDataURL)}) var(--media-object-position, center) / contain no-repeat`,
                    }}
                  />
                ) : undefined
              }
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
                startTime={startTime}
                source={{
                  playbackId,
                  customDomain: process.env.NEXT_PUBLIC_MUX_BYO_DOMAIN || undefined,
                }}
                crossOrigin="anonymous"
                streamType="on-demand"
                preload={preload ?? 'metadata'}
                autoPlay={autoplay || undefined}
                muted={autoplay || undefined}
                playsInline
              />
              <MuxData
                beaconCollectionDomain={MUX_DATA_CUSTOM_DOMAIN}
                envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
                playerSoftwareName={PLAYER_SOFTWARE_NAME[engine]}
                metadata={{
                  video_id: playbackId,
                  video_title: playbackId,
                  player_name: 'stream.new',
                }}
              />
            </VideoSkin>
          </VideoPlayer>
        </div>
        <PlayerActions playbackId={playbackId} shareUrl={shareUrl} />
        {perf ? <PerfMarks /> : null}
      </div>
    </Layout>
  );
};

export default VideojsV10PlayerPage;
