import { useEffect } from 'react';
import MuxPlayer from "@mux-elements/mux-player-react";

type Props = {
  playbackId: string
  poster: string
  currentTime?: number
  onLoaded: () => void
  onError: (error: ErrorEvent) => void
};

const VideoPlayer: React.FC<Props> = (({ playbackId, poster, currentTime, onLoaded }) => {

  useEffect(() => {
    onLoaded();
  }, []);

  return (
    <div className='video-container'>
      <MuxPlayer
        playbackId={playbackId}
        poster={poster}
        muted
        controls
        playsInline
        currentTime={currentTime}
      />
    </div>
  );
});

export default VideoPlayer;
