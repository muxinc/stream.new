import { useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react/lazy';
import ThemeClassic from '@mux/mux-player-react/themes/classic';
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
        onError={(err) => onError(err as unknown as ErrorEvent)}
        poster={poster}
        startTime={currentTime}
        envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
        streamType="on-demand"
        primaryColor={color}
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
        metadata={{
          video_id: playbackId,
          video_title: playbackId,
          player_name: 'stream.new',
        }}
        theme={ThemeClassic}
      />
    </>
  );
};

MuxPlayerInternal.displayName = 'MuxPlayerInternal';

export default MuxPlayerInternal;
