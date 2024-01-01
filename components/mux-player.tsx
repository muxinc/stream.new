import { useState, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react/lazy';
import type MuxPlayerElement from '@mux/mux-player';
import { MUX_DATA_CUSTOM_DOMAIN } from '../constants';
import P2pEngineHls from 'swarmcloud-hls';
import type { P2pConfig } from 'swarmcloud-hls';

type Props = {
  playbackId: string;
  color?: string;
  poster: string;
  currentTime?: number;
  blurHashBase64?: string;
  aspectRatio: number;
  onLoaded: () => void;
  onError: (error: ErrorEvent) => void;
  forwardedRef: React.ForwardedRef<MuxPlayerElement>;
  p2pConfig?: P2pConfig;
};

const MuxPlayerInternal: React.FC<Props> = ({
  forwardedRef,
  playbackId,
  poster,
  currentTime,
  color,
  blurHashBase64,
  onLoaded,
  aspectRatio,
  p2pConfig = {},
}) => {
  const [
    preferMse,
    _setPreferMse, // eslint-disable-line @typescript-eslint/no-unused-vars
  ] = useState(Math.random() < 0.5);

  useEffect(() => {
    onLoaded();
  }, []);

  const onLoadStart = (e: Event) => {
    const player = e.target;
    if (P2pEngineHls.isSupported() && (player as any)._hls) {
      new P2pEngineHls({
        hlsjsInstance: (player as any)._hls,
        ...p2pConfig
      });
    }
  };

  const onError = (err: ErrorEvent) => {
    console.warn(
      'Got an onError from Mux Player, the Player UI should be showing an error',
      err
    );
  };

  return (
    <>
      <MuxPlayer
        onLoadStart={(e) => {onLoadStart(e)}}
        ref={forwardedRef}
        beaconCollectionDomain={MUX_DATA_CUSTOM_DOMAIN}
        playbackId={playbackId}
        onError={(err) => onError(err as ErrorEvent)}
        poster={poster}
        startTime={currentTime}
        envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
        streamType="on-demand"
        accentColor={color}
        placeholder={blurHashBase64}
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
        preferPlayback={preferMse ? 'mse' : 'native'}
        metadata={{
          video_id: playbackId,
          video_title: playbackId,
          player_name: 'stream.new',
          experiment_name: `preferMse: ${preferMse}`,
        }}
      />
    </>
  );
};

MuxPlayerInternal.displayName = 'MuxPlayerInternal';

export default MuxPlayerInternal;
