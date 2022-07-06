import { useEffect } from 'react';
import MuxVideo from '@mux/mux-video-react';
import { MUX_DATA_CUSTOM_DOMAIN } from '../constants';

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
    // Followup: Figure out why TS error occurs here but not in demo nextjs app (CJP)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /** @ts-ignore */
    <MuxVideo
      beaconCollectionDomain={MUX_DATA_CUSTOM_DOMAIN}
      playbackId={playbackId}
      poster={poster}
      startTime={currentTime}
      envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
      streamType="on-demand"
      style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
      metadata={{
        video_id: playbackId,
        video_title: playbackId,
        player_name: 'Mux Video React',
      }}
      controls
    />
  );
};

MuxPlayerInternal.displayName = 'MuxPlayerInternal';

export default MuxPlayerInternal;
