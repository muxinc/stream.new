import { useState, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react/lazy';
import type MuxPlayerElement from '@mux/mux-player';
import { MUX_DATA_CUSTOM_DOMAIN } from '../constants';

type Props = {
  playbackId: string;
  color?: string;
  poster: string;
  currentTime?: number;
  blurDataURL?: string;
  aspectRatio: number;
  onLoaded: () => void;
  onError: (error: ErrorEvent) => void;
  forwardedRef: React.ForwardedRef<MuxPlayerElement>;
};

const MuxPlayerInternal: React.FC<Props> = ({
  forwardedRef,
  playbackId,
  poster,
  currentTime,
  color,
  blurDataURL,
  onLoaded,
  aspectRatio,
}) => {
  const [
    preferMse,
    _setPreferMse, // eslint-disable-line @typescript-eslint/no-unused-vars
  ] = useState(Math.random() < 0.5);

  useEffect(() => {
    onLoaded();
  }, []);

  const onError = (err: ErrorEvent) => {
    console.warn(
      'Got an onError from Mux Player, the Player UI should be showing an error',
      err
    );
  };

  return (
    <>
      <MuxPlayer
        ref={forwardedRef}
        beaconCollectionDomain={MUX_DATA_CUSTOM_DOMAIN}
        playbackId={playbackId}
        onError={(err) => onError(err as ErrorEvent)}
        poster={poster}
        startTime={currentTime}
        envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
        accentColor={color}
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
