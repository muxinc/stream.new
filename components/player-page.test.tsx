import React from 'react';
import { shallow } from 'enzyme';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import PlayerPage from './player-page';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('copy-to-clipboard', () => jest.fn());

jest.mock('./fullpage-loader', () => ({ text }) => (
  <div data-testid="fullpage-loader">{text}</div>
));

jest.mock('./player-loader', () => ({ 
  playbackId, 
  onLoaded, 
  onError, 
  playerType,
  color,
  poster,
  currentTime,
  aspectRatio,
  blurDataURL 
}) => (
  <div 
    data-testid="player-loader"
    data-playback-id={playbackId}
    data-player-type={playerType}
    data-color={color}
    data-poster={poster}
    data-current-time={currentTime}
    data-aspect-ratio={aspectRatio}
    data-blur-data-url={blurDataURL}
    onClick={() => onLoaded()}
  />
));

jest.mock('./layout', () => ({ 
  children, 
  metaTitle, 
  image, 
  playerEmbedUrl, 
  aspectRatio, 
  centered, 
  darkMode 
}) => (
  <div 
    data-testid="layout"
    data-meta-title={metaTitle}
    data-image={image}
    data-player-embed-url={playerEmbedUrl}
    data-aspect-ratio={aspectRatio}
    data-centered={centered}
    data-dark-mode={darkMode}
  >
    {children}
  </div>
));

jest.mock('./report-form', () => ({ playbackId, onClose }) => (
  <div 
    data-testid="report-form"
    data-playback-id={playbackId}
    onClick={onClose}
  />
));

jest.mock('../lib/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('PlayerPage Component', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    query: {},
    push: mockPush,
  };

  const defaultProps = {
    playbackId: 'test-playback-id',
    videoExists: true,
    shareUrl: 'https://stream.new/v/test-playback-id',
    poster: 'https://image.mux.com/test-playback-id/thumbnail.jpeg',
    playerType: 'mux' as const,
    blurDataURL: 'data:image/jpeg;base64,test-blur',
    aspectRatio: 16/9,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (copy as jest.Mock).mockReturnValue(true);
  });

  describe('Component Rendering', () => {
    it('renders without errors', () => {
      expect(() => {
        shallow(<PlayerPage {...defaultProps} />);
      }).not.toThrow();
    });

    it('accepts valid props', () => {
      const wrapper = shallow(<PlayerPage {...defaultProps} />);
      expect(wrapper).toBeDefined();
    });

    it('handles component lifecycle', () => {
      const wrapper = shallow(<PlayerPage {...defaultProps} />);
      expect(() => {
        wrapper.unmount();
      }).not.toThrow();
    });
  });

  describe('Props Validation', () => {
    it('handles required props', () => {
      expect(() => {
        shallow(<PlayerPage {...defaultProps} />);
      }).not.toThrow();
    });

    it('handles missing optional props', () => {
      const minimalProps = {
        playbackId: 'test-id',
        videoExists: true,
        shareUrl: 'https://stream.new/v/test-id',
        poster: 'test-poster.jpg',
        playerType: 'mux' as const,
        aspectRatio: 16/9,
      };
      
      expect(() => {
        shallow(<PlayerPage {...minimalProps} />);
      }).not.toThrow();
    });
  });

  describe('Router Integration', () => {
    it('integrates with Next.js router', () => {
      shallow(<PlayerPage {...defaultProps} />);
      expect(useRouter).toHaveBeenCalled();
    });

    it('handles different router states', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { color: 'ff0000', time: '30' },
      });

      expect(() => {
        shallow(<PlayerPage {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('handles video not existing', () => {
      expect(() => {
        shallow(<PlayerPage {...defaultProps} videoExists={false} />);
      }).not.toThrow();
    });

    it('handles invalid player type', () => {
      expect(() => {
        shallow(<PlayerPage {...defaultProps} playerType={'invalid' as any} />);
      }).not.toThrow();
    });
  });

  describe('Logger Integration', () => {
    it('uses logger for warnings', () => {
      const { warn } = require('../lib/logger');
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { color: 'invalid-color' },
      });

      shallow(<PlayerPage {...defaultProps} />);
      
      expect(warn).toHaveBeenCalledWith('Invalid color hex value param:', 'invalid-color');
    });
  });
});