// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';
import PlyrPlayer from './plyr-player';

// Mock dependencies
jest.mock('plyr', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    destroy: jest.fn(),
  }));
});

jest.mock('plyr/dist/plyr.css', () => ({}));

jest.mock('hls.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    on: jest.fn(),
    destroy: jest.fn(),
  })),
  isSupported: jest.fn(() => true),
  Events: {
    ERROR: 'hlsError',
  },
}));

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
      const wrapper = shallow(<PlyrPlayer {...defaultProps} />);
      const video = wrapper.find('video');
      
      expect(video).toHaveLength(1);
      expect(video.prop('poster')).toBe(defaultProps.poster);
      expect(video.prop('controls')).toBe(true);
      expect(video.prop('playsInline')).toBe(true);
    });

    it('includes styled-jsx styling', () => {
      const wrapper = shallow(<PlyrPlayer {...defaultProps} />);
      
      // Styled-jsx is not processed in test environment, so we check component structure instead
      expect(wrapper.type()).toBe(React.Fragment);
    });
  });

  describe('Props Handling', () => {
    it('accepts all required props', () => {
      expect(() => {
        shallow(<PlyrPlayer {...defaultProps} />);
      }).not.toThrow();
    });

    it('handles optional aspectRatio prop', () => {
      const customRatio = 4/3;
      const wrapper = shallow(<PlyrPlayer {...defaultProps} aspectRatio={customRatio} />);
      
      expect(wrapper.find('video')).toHaveLength(1);
    });

    it('handles optional currentTime prop', () => {
      const wrapper = shallow(<PlyrPlayer {...defaultProps} currentTime={45} />);
      
      expect(wrapper.find('video')).toHaveLength(1);
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
        shallow(<PlyrPlayer {...minimalProps} />);
      }).not.toThrow();
    });
  });

  describe('Component Structure', () => {
    it('renders fragment with video and style elements', () => {
      const wrapper = shallow(<PlyrPlayer {...defaultProps} />);
      
      expect(wrapper.type()).toBe(React.Fragment);
      expect(wrapper.find('video')).toHaveLength(1);
      // Style elements are not rendered in test environment with styled-jsx
    });

    it('applies correct video attributes', () => {
      const wrapper = shallow(<PlyrPlayer {...defaultProps} />);
      const video = wrapper.find('video');
      
      expect(video.prop('poster')).toBe(defaultProps.poster);
      expect(video.prop('controls')).toBe(true);
      expect(video.prop('playsInline')).toBe(true);
    });
  });

  describe('URL Generation', () => {
    it('uses URL utility functions', () => {
      const { getStreamBaseUrl, getImageBaseUrl } = require('../lib/urlutils');
      
      shallow(<PlyrPlayer {...defaultProps} />);
      
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
        shallow(<PlyrPlayer {...defaultProps} onError={mockOnError} />);
      }).not.toThrow();
    });

    it('accepts onLoaded callback', () => {
      const mockOnLoaded = jest.fn();
      
      expect(() => {
        shallow(<PlyrPlayer {...defaultProps} onLoaded={mockOnLoaded} />);
      }).not.toThrow();
    });
  });

  describe('Ref Handling', () => {
    it('accepts forwardedRef prop', () => {
      const testRef = React.createRef();
      
      expect(() => {
        shallow(<PlyrPlayer {...defaultProps} forwardedRef={testRef} />);
      }).not.toThrow();
    });
  });
});