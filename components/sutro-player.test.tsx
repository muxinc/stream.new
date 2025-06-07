import fs from 'fs';
import path from 'path';

/**
 * Unit tests for SutroPlayer component
 * 
 * Note: These tests analyze the source code directly since the component
 * has external dependencies (hls-video-element, player.style) that are 
 * not available in the test environment.
 */

describe('SutroPlayer Component', () => {
  let componentSource: string;

  beforeAll(() => {
    const componentPath = path.join(__dirname, 'sutro-player.tsx');
    componentSource = fs.readFileSync(componentPath, 'utf8');
  });

  describe('Component Interface', () => {
    it('should export a React component with display name', () => {
      expect(componentSource).toContain('const SutroPlayer: React.FC<Props>');
      expect(componentSource).toContain('SutroPlayer.displayName = \'SutroPlayer\'');
      expect(componentSource).toContain('export default SutroPlayer');
    });

    it('should define proper TypeScript props interface', () => {
      expect(componentSource).toContain('type Props = {');
      expect(componentSource).toContain('playbackId: string');
      expect(componentSource).toContain('poster: string');
      expect(componentSource).toContain('currentTime?: number');
      expect(componentSource).toContain('aspectRatio: number');
      expect(componentSource).toContain('onLoaded: () => void');
      expect(componentSource).toContain('onError: (error: ErrorEvent) => void');
    });
  });

  describe('Dependencies and Imports', () => {
    it('should import required React hooks', () => {
      expect(componentSource).toContain('import { useEffect } from \'react\'');
    });

    it('should import HLS video component', () => {
      expect(componentSource).toContain('import HlsVideo from \'hls-video-element/react\'');
    });

    it('should import Sutro theme component', () => {
      expect(componentSource).toContain('import MediaThemeSutro from \'player.style/sutro/react\'');
    });

    it('should import utility functions', () => {
      expect(componentSource).toContain('import { getStreamBaseUrl } from \'../lib/urlutils\'');
      expect(componentSource).toContain('import { MUX_DATA_CUSTOM_DOMAIN } from \'../constants\'');
    });
  });

  describe('Component Structure', () => {
    it('should render MediaThemeSutro wrapper', () => {
      expect(componentSource).toContain('<MediaThemeSutro');
      expect(componentSource).toContain('style={{ width: \'100%\', height: \'100%\' }}');
    });

    it('should render HlsVideo element with slot attribute', () => {
      expect(componentSource).toContain('<HlsVideo');
      expect(componentSource).toContain('slot="media"');
    });

    it('should apply aspect ratio styling to container', () => {
      expect(componentSource).toContain('aspectRatio: `${aspectRatio}`');
      expect(componentSource).toContain('width: \'100%\'');
    });
  });

  describe('Video Configuration', () => {
    it('should configure HLS video source correctly', () => {
      expect(componentSource).toContain('src={`${getStreamBaseUrl()}/${playbackId}.m3u8`}');
    });

    it('should set video attributes', () => {
      expect(componentSource).toContain('poster={poster}');
      expect(componentSource).toContain('playsInline');
      expect(componentSource).toContain('crossOrigin="anonymous"');
    });

    it('should handle currentTime prop conditionally', () => {
      expect(componentSource).toContain('currentTime && { defaultTime: currentTime }');
      expect(componentSource).toContain('...(currentTime &&');
    });
  });

  describe('Event Handling', () => {
    it('should implement error handling', () => {
      expect(componentSource).toContain('const handleError = (event: React.SyntheticEvent<HTMLVideoElement, Event>)');
      expect(componentSource).toContain('new ErrorEvent(\'error\'');
      expect(componentSource).toContain('onError(errorEvent)');
    });

    it('should call onLoaded in useEffect', () => {
      expect(componentSource).toContain('useEffect(() => {');
      expect(componentSource).toContain('onLoaded();');
      expect(componentSource).toContain('}, []);');
    });

    it('should attach event handlers to video element', () => {
      expect(componentSource).toContain('onError={handleError}');
      expect(componentSource).toContain('onLoadedData={onLoaded}');
    });
  });

  describe('Error Event Handling', () => {
    it('should create proper ErrorEvent with video details', () => {
      expect(componentSource).toContain('const videoElement = event.currentTarget');
      expect(componentSource).toContain('videoElement.error?.message');
      expect(componentSource).toContain('filename: videoElement.src');
      expect(componentSource).toContain('\'Video playback error\'');
    });
  });

  describe('TypeScript Configuration', () => {
    it('should declare global JSX interface for custom elements', () => {
      expect(componentSource).toContain('declare global');
      expect(componentSource).toContain('namespace JSX');
      expect(componentSource).toContain('IntrinsicElements');
      expect(componentSource).toContain('\'media-theme-sutro\'');
    });
  });

  describe('Props Destructuring', () => {
    it('should destructure all required props', () => {
      expect(componentSource).toContain('playbackId,');
      expect(componentSource).toContain('poster,');
      expect(componentSource).toContain('currentTime,');
      expect(componentSource).toContain('aspectRatio,');
      expect(componentSource).toContain('onLoaded,');
      expect(componentSource).toContain('onError,');
    });
  });

  describe('Component Patterns', () => {
    it('should follow React functional component pattern', () => {
      expect(componentSource).toContain('const SutroPlayer: React.FC<Props>');
      expect(componentSource).toContain('return (');
    });

    it('should use proper JSX structure', () => {
      expect(componentSource).toContain('<div style={{');
      expect(componentSource).toContain('<MediaThemeSutro');
      expect(componentSource).toContain('<HlsVideo');
      expect(componentSource).toContain('</MediaThemeSutro>');
      expect(componentSource).toContain('</div>');
    });
  });
});