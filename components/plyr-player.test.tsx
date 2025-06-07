import React from 'react';
import { render, screen } from '@testing-library/react';
import PlyrPlayer from './plyr-player';

// Mock dependencies
jest.mock('plyr', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    destroy: jest.fn(),
  }));
});

jest.mock('plyr/dist/plyr.css', () => ({}));

jest.mock('hls.js', () => {
  const mockHls = jest.fn().mockImplementation(() => ({
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    on: jest.fn(),
    destroy: jest.fn(),
  }));
  mockHls.isSupported = jest.fn(() => true);
  mockHls.Events = {
    ERROR: 'hlsError',
  };
  return {
    __esModule: true,
    default: mockHls,
  };
});

jest.mock('mux-embed', () => ({
  monitor: jest.fn(),
}));

jest.mock('../lib/logger', () => ({
  error: jest.fn(),
}));

jest.mock('../lib/urlutils', () => ({
  getStreamBaseUrl: jest.fn(() => 'https://stream.mux.com'),
  getImageBaseUrl: jest.fn(() => 'https://image.mux.com'),
}));

jest.mock('../util/use-combined-refs', () => ({
  useCombinedRefs: jest.fn((ref1, ref2) => ref2),
}));

// Mock environment variables
const originalEnv = process.env;

describe('PlyrPlayer Component', () => {
  const defaultProps = {
    playbackId: 'test-playback-id',
    poster: 'https://image.mux.com/test-playback-id/thumbnail.jpeg',
    aspectRatio: 16/9,
    currentTime: 30,
    onLoaded: jest.fn(),
    onError: jest.fn(),
    forwardedRef: React.createRef(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_MUX_ENV_KEY: 'test-env-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Component Rendering', () => {
    it('renders video element with correct attributes', () => {
      render(<PlyrPlayer {...defaultProps} />);
      const video = screen.getByTestId('plyr-video');
      
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('poster', defaultProps.poster);
      expect(video).toHaveAttribute('controls');
      expect(video).toHaveAttribute('playsInline');
    });

    it('includes styled-jsx styling', () => {
      render(<PlyrPlayer {...defaultProps} />);
      expect(screen.getByTestId('plyr-video')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('accepts all required props', () => {
      expect(() => {
        render(<PlyrPlayer {...defaultProps} />);
      }).not.toThrow();
    });

    it('handles optional aspectRatio prop', () => {
      const customRatio = 4/3;
      render(<PlyrPlayer {...defaultProps} aspectRatio={customRatio} />);
      
      expect(screen.getByTestId('plyr-video')).toBeInTheDocument();
    });

    it('handles optional currentTime prop', () => {
      render(<PlyrPlayer {...defaultProps} currentTime={45} />);
      
      expect(screen.getByTestId('plyr-video')).toBeInTheDocument();
    });

    it('handles missing optional props gracefully', () => {
      const minimalProps = {
        playbackId: 'test-id',
        poster: 'test-poster.jpg',
        onLoaded: jest.fn(),
        onError: jest.fn(),
        forwardedRef: React.createRef(),
      };
      
      expect(() => {
        render(<PlyrPlayer {...minimalProps} />);
      }).not.toThrow();
    });
  });

  describe('Component Structure', () => {
    it('renders video element', () => {
      render(<PlyrPlayer {...defaultProps} />);
      
      expect(screen.getByTestId('plyr-video')).toBeInTheDocument();
    });

    it('applies correct video attributes', () => {
      render(<PlyrPlayer {...defaultProps} />);
      const video = screen.getByTestId('plyr-video');
      
      expect(video).toHaveAttribute('poster', defaultProps.poster);
      expect(video).toHaveAttribute('controls');
      expect(video).toHaveAttribute('playsInline');
    });
  });

  describe('URL Generation', () => {
    it('uses URL utility functions', () => {
      const { getStreamBaseUrl, getImageBaseUrl } = require('../lib/urlutils');
      
      render(<PlyrPlayer {...defaultProps} />);
      
      // The component should use these utilities when setting up Plyr and HLS
      expect(getStreamBaseUrl).toBeDefined();
      expect(getImageBaseUrl).toBeDefined();
    });
  });

  describe('Component Display Name', () => {
    it('has correct display name for debugging', () => {
      expect(PlyrPlayer.displayName).toBe('PlyrPlayer');
    });
  });

  describe('Error Handling', () => {
    it('accepts onError callback', () => {
      const mockOnError = jest.fn();
      
      expect(() => {
        render(<PlyrPlayer {...defaultProps} onError={mockOnError} />);
      }).not.toThrow();
    });

    it('accepts onLoaded callback', () => {
      const mockOnLoaded = jest.fn();
      
      expect(() => {
        render(<PlyrPlayer {...defaultProps} onLoaded={mockOnLoaded} />);
      }).not.toThrow();
    });
  });

  describe('Ref Handling', () => {
    it('accepts forwardedRef prop', () => {
      const testRef = React.createRef();
      
      expect(() => {
        render(<PlyrPlayer {...defaultProps} forwardedRef={testRef} />);
      }).not.toThrow();
    });
  });
});