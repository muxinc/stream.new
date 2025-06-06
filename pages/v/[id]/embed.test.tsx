import React from 'react';
import { shallow } from 'enzyme';
import { useRouter } from 'next/router';
import { getStaticProps, getStaticPaths } from './embed';
import PlaybackEmbedded from './embed';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../components/fullpage-loader', () => ({ text }) => (
  <div data-testid="fullpage-loader">{text}</div>
));

jest.mock('../../../components/player-loader', () => 
  React.forwardRef<any, any>(({ 
    playbackId, 
    poster, 
    currentTime, 
    aspectRatio, 
    onLoaded, 
    onError, 
    playerType 
  }, ref) => (
    <div 
      ref={ref}
      data-testid="player-loader"
      data-playback-id={playbackId}
      data-poster={poster}
      data-current-time={currentTime}
      data-aspect-ratio={aspectRatio}
      data-player-type={playerType}
      onClick={() => onLoaded && onLoaded()}
      onError={() => onError && onError(new ErrorEvent('Player error'))}
    />
  ))
);

jest.mock('../../../components/layout', () => ({ 
  children, 
  metaTitle, 
  image, 
  centered, 
  darkMode 
}) => (
  <div 
    data-testid="layout"
    data-meta-title={metaTitle}
    data-image={image}
    data-centered={centered}
    data-dark-mode={darkMode}
  >
    {children}
  </div>
));

jest.mock('../../../components/asterisk', () => ({ size }) => (
  <div data-testid="asterisk" data-size={size} />
));

jest.mock('../../../lib/logger', () => ({
  error: jest.fn(),
}));

jest.mock('../../../lib/image-dimensions', () => ({
  getImageDimensions: jest.fn(),
}));

jest.mock('../../../lib/urlutils', () => ({
  getImageBaseUrl: jest.fn(() => 'https://image.mux.com'),
}));

describe('PlaybackEmbedded Component', () => {
  const defaultProps = {
    playbackId: 'test-playback-id',
    shareUrl: 'https://stream.new/v/test-playback-id',
    poster: 'https://image.mux.com/test-playback-id/thumbnail.png',
    width: 640,
    height: 360,
    aspectRatio: 16/9,
    videoExists: true,
  };

  const mockRouter = {
    isFallback: false,
    query: {},
  };

  const mockVideoRef = {
    play: jest.fn(),
    pause: jest.fn(),
    paused: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Loading States', () => {
    it('shows fallback loader when router is in fallback mode', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        isFallback: true,
      });

      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      expect(wrapper.find('[data-testid="fullpage-loader"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="fullpage-loader"]').prop('children')).toBe('Loading player...');
    });

    it('shows loading state before player loads', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      expect(wrapper.find('[data-testid="fullpage-loader"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="fullpage-loader"]').prop('children')).toBe('Loading player');
    });

    it('hides loading state when player loads', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      // Trigger player load
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      
      expect(wrapper.find('[data-testid="fullpage-loader"]')).toHaveLength(0);
    });
  });

  describe('Player Integration', () => {
    it('renders player loader with correct props', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      const playerLoader = wrapper.find('[data-testid="player-loader"]');
      
      expect(playerLoader.prop('data-playback-id')).toBe('test-playback-id');
      expect(playerLoader.prop('data-poster')).toBe(defaultProps.poster);
      expect(playerLoader.prop('data-aspect-ratio')).toBe(16/9);
      expect(playerLoader.prop('data-player-type')).toBe('mux-player');
    });

    it('handles start time from query parameters', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { time: '30.5' },
      });

      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      const playerLoader = wrapper.find('[data-testid="player-loader"]');
      
      expect(playerLoader.prop('data-current-time')).toBe(30.5);
    });

    it('defaults to 0 for invalid time parameter', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { time: 'invalid' },
      });

      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      const playerLoader = wrapper.find('[data-testid="player-loader"]');
      
      expect(playerLoader.prop('data-current-time')).toBe(0);
    });

    it('handles player errors', () => {
      const { error } = require('../../../lib/logger');
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      wrapper.find('[data-testid="player-loader"]').simulate('error');
      
      expect(wrapper.text()).toContain('This video does not exist');
      expect(error).toHaveBeenCalled();
    });
  });

  describe('Asterisk Button and Overlay', () => {
    it('renders asterisk button', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      expect(wrapper.find('[data-testid="asterisk"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="asterisk"]').prop('data-size')).toBe(25);
    });

    it('shows overlay when asterisk button is clicked', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      // Load player first
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      
      const asteriskButton = wrapper.find('a').first();
      asteriskButton.simulate('click');
      
      expect(wrapper.find('.overlay-container')).toHaveLength(1);
      expect(wrapper.text()).toContain('View this video on stream.new');
    });

    it('pauses video when opening overlay if playing', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      const instance = wrapper.instance() as any;
      instance.videoRef.current = { ...mockVideoRef, paused: false };
      
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      
      const asteriskButton = wrapper.find('a').first();
      asteriskButton.simulate('click');
      
      expect(instance.videoRef.current.pause).toHaveBeenCalled();
    });

    it('resumes video when closing overlay if was playing', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      const instance = wrapper.instance() as any;
      instance.videoRef.current = { ...mockVideoRef, paused: false };
      
      // Load player and open overlay
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      const asteriskButton = wrapper.find('a').first();
      asteriskButton.simulate('click');
      
      // Close overlay
      const closeButton = wrapper.find('.overlay-container a').last();
      closeButton.simulate('click');
      
      expect(instance.videoRef.current.play).toHaveBeenCalled();
    });

    it('does not resume video when closing overlay if was paused', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      const instance = wrapper.instance() as any;
      instance.videoRef.current = { ...mockVideoRef, paused: true };
      
      // Load player and open overlay
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      const asteriskButton = wrapper.find('a').first();
      asteriskButton.simulate('click');
      
      // Close overlay
      const closeButton = wrapper.find('.overlay-container a').last();
      closeButton.simulate('click');
      
      expect(instance.videoRef.current.play).not.toHaveBeenCalled();
    });
  });

  describe('Overlay Content', () => {
    it('displays correct links in overlay', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      // Load player and open overlay
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      const asteriskButton = wrapper.find('a').first();
      asteriskButton.simulate('click');
      
      expect(wrapper.text()).toContain('View this video on stream.new');
      expect(wrapper.text()).toContain('open source');
      expect(wrapper.text()).toContain('Mux');
      expect(wrapper.text()).toContain('video streaming API');
    });

    it('creates correct non-embed URL', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      // Load player and open overlay
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      const asteriskButton = wrapper.find('a').first();
      asteriskButton.simulate('click');
      
      const streamNewLink = wrapper.find('.overlay-container a').first();
      expect(streamNewLink.prop('href')).toBe('/v/test-playback-id');
    });

    it('opens external links in new tab', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      // Load player and open overlay
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      const asteriskButton = wrapper.find('a').first();
      asteriskButton.simulate('click');
      
      const externalLinks = wrapper.find('.overlay-container a[target="_blank"]');
      expect(externalLinks.length).toBeGreaterThan(0);
      externalLinks.forEach(link => {
        expect(link.prop('rel')).toBe('noreferrer');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when video fails to load', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      wrapper.find('[data-testid="player-loader"]').simulate('error');
      
      expect(wrapper.find('.error-message')).toHaveLength(1);
      expect(wrapper.text()).toContain('This video does not exist');
    });

    it('hides loading state when error occurs', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      wrapper.find('[data-testid="player-loader"]').simulate('error');
      
      expect(wrapper.find('[data-testid="fullpage-loader"]')).toHaveLength(0);
    });
  });

  describe('Keyboard Accessibility', () => {
    it('supports keyboard navigation for asterisk button', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      
      const asteriskButton = wrapper.find('a').first();
      expect(asteriskButton.prop('role')).toBe('button');
      expect(asteriskButton.prop('tabIndex')).toBe(0);
    });

    it('supports keyboard navigation for close button', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      // Load player and open overlay
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      const asteriskButton = wrapper.find('a').first();
      asteriskButton.simulate('click');
      
      const closeButton = wrapper.find('.overlay-container a').last();
      expect(closeButton.prop('role')).toBe('link');
      expect(closeButton.prop('tabIndex')).toBe(0);
    });

    it('handles keypress events for overlay controls', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      wrapper.find('[data-testid="player-loader"]').simulate('click');
      
      const asteriskButton = wrapper.find('a').first();
      asteriskButton.simulate('keypress');
      
      expect(wrapper.find('.overlay-container')).toHaveLength(1);
    });
  });

  describe('Styling and Layout', () => {
    it('includes global font family styles', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      const styles = wrapper.find('style').prop('children');
      expect(styles).toContain(':global(html)');
      expect(styles).toContain('font-family: Akkurat');
    });

    it('positions asterisk container correctly', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      const styles = wrapper.find('style').prop('children');
      expect(styles).toContain('.asterisk-container');
      expect(styles).toContain('position: absolute');
      expect(styles).toContain('top: 1.2rem');
    });

    it('styles overlay container correctly', () => {
      const wrapper = shallow(<PlaybackEmbedded {...defaultProps} />);
      
      const styles = wrapper.find('style').prop('children');
      expect(styles).toContain('.overlay-container');
      expect(styles).toContain('background-color: #111');
      expect(styles).toContain('z-index: 200');
    });
  });
});

describe('getStaticProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns props when video exists', async () => {
    const { getImageDimensions } = require('../../../lib/image-dimensions');
    getImageDimensions.mockResolvedValue({
      width: 640,
      height: 360,
      aspectRatio: 16/9,
    });

    const context = {
      params: { id: 'test-playback-id' },
    };

    const result = await getStaticProps(context as any);

    expect(result).toEqual({
      props: {
        playbackId: 'test-playback-id',
        videoExists: true,
        shareUrl: 'https://stream.new/v/test-playback-id',
        poster: 'https://image.mux.com/test-playback-id/thumbnail.png',
        width: 640,
        height: 360,
        aspectRatio: 16/9,
      },
    });
  });

  it('returns props when video does not exist', async () => {
    const { getImageDimensions } = require('../../../lib/image-dimensions');
    getImageDimensions.mockResolvedValue(null);

    const context = {
      params: { id: 'non-existent-id' },
    };

    const result = await getStaticProps(context as any);

    expect(result).toEqual({
      props: {
        playbackId: 'non-existent-id',
        videoExists: false,
      },
    });
  });

  it('calls getImageDimensions with correct playback ID', async () => {
    const { getImageDimensions } = require('../../../lib/image-dimensions');
    getImageDimensions.mockResolvedValue({ width: 640, height: 360 });

    const context = {
      params: { id: 'test-id' },
    };

    await getStaticProps(context as any);

    expect(getImageDimensions).toHaveBeenCalledWith('test-id');
  });
});

describe('getStaticPaths', () => {
  it('returns empty paths with fallback true', async () => {
    const result = await getStaticPaths();

    expect(result).toEqual({
      paths: [],
      fallback: true,
    });
  });
});