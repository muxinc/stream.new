import { useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import type MuxPlayerElement from '@mux/mux-player';

type Props = {
  playbackId: string
  color?: string
  poster: string
  currentTime?: number
  aspectRatio: number
  onLoaded: () => void
  onError: (error: ErrorEvent) => void
  forwardedRef: React.ForwardedRef<MuxPlayerElement>;
};

const MuxPlayerInternal: React.FC<Props> = ({ forwardedRef, playbackId, poster, currentTime, color, onLoaded, aspectRatio}) => {
  useEffect(() => {
    onLoaded();
  }, []);

  const onError = (err: ErrorEvent) => {
    console.warn('Got an onError from Mux Player, the Player UI should be showing an error', err);
  };

  return (
    <MuxPlayer
      ref={forwardedRef}
      playbackId={playbackId}
      onError={(err) => onError(err as ErrorEvent)}
      poster={poster}
      startTime={currentTime}
      envKey={'b6qi9n2fgctdopffhsg9h14b9'}
      streamType="on-demand"
      primaryColor={color}
      style={{ aspectRatio: `${aspectRatio}`, maxWidth: '100%', maxHeight: '100%', width: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
      metadata={{
        video_id: playbackId,
        video_title: playbackId,
        player_name: 'Mux Player',
      }}
    />
  );
};

MuxPlayerInternal.displayName = 'MuxPlayerInternal';

export default MuxPlayerInternal;
