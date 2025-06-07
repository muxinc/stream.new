import { useEffect } from 'react';
import HlsVideo from 'hls-video-element/react';
import MediaThemeSutro from 'player.style/sutro/react';
import { getStreamBaseUrl } from '../lib/urlutils';
import { MUX_DATA_CUSTOM_DOMAIN } from '../constants';

// Add type declaration for the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'media-theme-sutro': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

type Props = {
  playbackId: string;
  poster: string;
  currentTime?: number;
  aspectRatio: number;
  onLoaded: () => void;
  onError: (error: ErrorEvent) => void;
};

const SutroPlayer: React.FC<Props> = ({
  playbackId,
  poster,
  currentTime,
  aspectRatio,
  onLoaded,
  onError,
}) => {
  useEffect(() => {
    onLoaded();
  }, []);

  const handleError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    // Create a new ErrorEvent with the error details from the video element
    const videoElement = event.currentTarget;
    const errorEvent = new ErrorEvent('error', {
      message: videoElement.error?.message || 'Video playback error',
      error: videoElement.error,
      filename: videoElement.src,
      lineno: 0,
      colno: 0,
    });
    onError(errorEvent);
  };

  return (
    <div style={{ width: '100%', aspectRatio: `${aspectRatio}` }}>
      <MediaThemeSutro style={{ width: '100%', height: '100%' }}>
        <HlsVideo
          slot="media"
          src={`${getStreamBaseUrl()}/${playbackId}.m3u8`}
          poster={poster}
          playsInline
          crossOrigin="anonymous"
          onError={handleError}
          onLoadedData={onLoaded}
          {...(currentTime && { defaultTime: currentTime })}
        />
      </MediaThemeSutro>
    </div>
  );
};

SutroPlayer.displayName = 'SutroPlayer';

export default SutroPlayer; 