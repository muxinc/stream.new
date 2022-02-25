import { useEffect } from 'react';
import MuxPlayer from '@mux-elements/mux-player-react';

type Props = {
  playbackId: string
  poster: string
  currentTime?: number
  aspectRatio: number
  onLoaded: () => void
  onError: (error: ErrorEvent) => void;
};

const MuxPlayerInternal: React.FC<Props> = ({ playbackId, poster, currentTime, onLoaded, aspectRatio}) => {
  useEffect(() => {
    onLoaded();
  }, []);

  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={poster}
      startTime={currentTime}
      envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
      streamType="on-demand"
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
