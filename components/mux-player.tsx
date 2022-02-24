import { useEffect } from 'react';
import MuxPlayer from '@mux-elements/mux-player-react';

type Props = {
  playbackId: string
  poster: string
  currentTime?: number
  onLoaded: () => void
  onError: (error: ErrorEvent) => void;
};

const MuxPlayerInternal: React.FC<Props> = ({ playbackId, poster, currentTime, onLoaded}) => {
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
      metadata={{
        video_id: playbackId,
        video_title: playbackId,
        video_stream_type: 'on-demand',
      }}
    />
  );
};

MuxPlayerInternal.displayName = 'MuxPlayerInternal';

export default MuxPlayerInternal;
