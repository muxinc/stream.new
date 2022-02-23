import { useEffect } from 'react';
import MuxPlayer from '@mux-elements/mux-player-react';

type Props = {
  playbackId: string
  poster: string
  currentTime?: number
  onLoaded: () => void
  onError: (error: ErrorEvent) => void;
};

const MuxPlayerInternal: React.FC<Props> = ({ playbackId, poster, currentTime, onLoaded, onError }) => {
  useEffect(() => {
    onLoaded();
  }, []);

  return (
    <>
      <MuxPlayer playbackId={playbackId} poster={poster} startTime={currentTime} onError={(err) => onError(err as ErrorEvent)} envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY} streamType="on-demand" />
    </>
  );
};

MuxPlayerInternal.displayName = 'MuxPlayerInternal';

export default MuxPlayerInternal;
