import { useEffect } from 'react';
import MuxVideo from '@mux-elements/mux-video-react';

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
    <MuxVideo
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
      controls
    />
  );
};

MuxPlayerInternal.displayName = 'MuxPlayerInternal';

export default MuxPlayerInternal;
