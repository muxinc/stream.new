// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';
import Router, { useRouter } from 'next/router';
import useSwr from 'swr';
import Asset from './[id]';

// Mock dependencies
jest.mock('next/router', () => ({
  push: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('swr', () => jest.fn());

jest.mock('../../components/layout', () => ({ 
  children, 
  centered, 
  darkMode, 
  spinningLogo 
}) => (
  <div 
    data-testid="layout"
    data-centered={centered}
    data-dark-mode={darkMode}
    data-spinning-logo={spinningLogo}
  >
    {children}
  </div>
));

jest.mock('../../components/button', () => ({ children, onClick }) => (
  <button data-testid="button" onClick={onClick}>
    {children}
  </button>
));

jest.mock('../../components/fullpage-loader', () => ({ text }) => (
  <div data-testid="fullpage-loader">{text}</div>
));

// Mock setTimeout
jest.useFakeTimers();

describe('Asset Page', () => {
  const mockRouter = {
    query: { id: 'test-asset-id' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSwr as jest.Mock).mockReturnValue({ data: null, error: null });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('Loading State', () => {
    it('renders loading state by default', () => {
      const wrapper = shallow(<Asset />);
      
      expect(wrapper.find('[data-testid="fullpage-loader"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="fullpage-loader"]').prop('children')).toBe('Preparing');
    });

    it('shows dark mode transition after setTimeout', () => {
      const wrapper = shallow(<Asset />);
      
      // Initially should be light mode
      expect(wrapper.find('[data-testid="layout"]').prop('data-dark-mode')).toBe(false);
      
      // Fast-forward time
      jest.advanceTimersByTime(100);
      wrapper.update();
      
      expect(wrapper.find('[data-testid="layout"]').prop('data-dark-mode')).toBe(true);
    });

    it('shows centered layout with spinning logo', () => {
      const wrapper = shallow(<Asset />);
      const layout = wrapper.find('[data-testid="layout"]');
      
      expect(layout.prop('data-centered')).toBe(true);
      expect(layout.prop('data-spinning-logo')).toBe(true);
    });
  });

  describe('SWR Data Fetching', () => {
    it('polls asset API with correct parameters', () => {
      shallow(<Asset />);
      
      expect(useSwr).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        { refreshInterval: 5000 }
      );
    });

    it('does not fetch when no asset ID in router', () => {
      (useRouter as jest.Mock).mockReturnValue({
        query: {}
      });
      
      shallow(<Asset />);
      
      const swrCall = (useSwr as jest.Mock).mock.calls[0];
      const keyFunction = swrCall[0];
      expect(keyFunction()).toBeNull();
    });

    it('fetches correct API endpoint when asset ID is present', () => {
      shallow(<Asset />);
      
      const swrCall = (useSwr as jest.Mock).mock.calls[0];
      const keyFunction = swrCall[0];
      expect(keyFunction()).toBe('/api/assets/test-asset-id');
    });
  });

  describe('Asset Processing Success', () => {
    it('redirects to video page when asset is ready', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          asset: {
            playback_id: 'test-playback-id',
            status: 'ready'
          }
        },
        error: null
      });
      
      shallow(<Asset />);
      
      expect(Router.push).toHaveBeenCalledWith('/v/test-playback-id');
    });

    it('does not redirect when asset is not ready', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          asset: {
            playback_id: 'test-playback-id',
            status: 'preparing'
          }
        },
        error: null
      });
      
      shallow(<Asset />);
      
      expect(Router.push).not.toHaveBeenCalled();
    });

    it('does not redirect when asset has no playback_id', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          asset: {
            status: 'ready'
          }
        },
        error: null
      });
      
      shallow(<Asset />);
      
      expect(Router.push).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when SWR returns error', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: null,
        error: new Error('Network error')
      });
      
      const wrapper = shallow(<Asset />);
      
      expect(wrapper.text()).toContain('Error fetching api');
      expect(wrapper.find('[data-testid="button"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="button"]').text()).toBe('Home');
    });

    it('shows error message when API returns error', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          error: 'Asset not found'
        },
        error: null
      });
      
      const wrapper = shallow(<Asset />);
      
      expect(wrapper.text()).toContain('Asset not found');
    });

    it('shows error message when asset status is errored', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          asset: {
            status: 'errored',
            errors: {
              messages: ['Invalid video format']
            }
          }
        },
        error: null
      });
      
      const wrapper = shallow(<Asset />);
      
      expect(wrapper.text()).toContain('Error creating this asset');
      expect(wrapper.text()).toContain('Please upload a valid video file');
      expect(wrapper.text()).toContain('Invalid video format');
    });

    it('shows error without details when no error messages', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          asset: {
            status: 'errored'
          }
        },
        error: null
      });
      
      const wrapper = shallow(<Asset />);
      
      expect(wrapper.text()).toContain('Error creating this asset');
      expect(wrapper.text()).not.toContain('Invalid video format');
    });

    it('uses light mode for error display', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: null,
        error: new Error('Network error')
      });
      
      const wrapper = shallow(<Asset />);
      const layout = wrapper.find('[data-testid="layout"]');
      
      expect(layout.prop('data-dark-mode')).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('renders home link in error state', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: null,
        error: new Error('Network error')
      });
      
      const wrapper = shallow(<Asset />);
      
      expect(wrapper.find('Link[href="/"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="button"]').text()).toBe('Home');
    });
  });

  describe('Asset Status Handling', () => {
    it('continues polling when asset is preparing', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          asset: {
            status: 'preparing'
          }
        },
        error: null
      });
      
      const wrapper = shallow(<Asset />);
      
      expect(wrapper.find('[data-testid="fullpage-loader"]')).toHaveLength(1);
      expect(Router.push).not.toHaveBeenCalled();
    });

    it('continues polling when asset is waiting', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          asset: {
            status: 'waiting'
          }
        },
        error: null
      });
      
      const wrapper = shallow(<Asset />);
      
      expect(wrapper.find('[data-testid="fullpage-loader"]')).toHaveLength(1);
      expect(Router.push).not.toHaveBeenCalled();
    });

    it('handles missing asset data gracefully', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {},
        error: null
      });
      
      const wrapper = shallow(<Asset />);
      
      expect(wrapper.find('[data-testid="fullpage-loader"]')).toHaveLength(1);
      expect(Router.push).not.toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('sets up dark mode transition on mount', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      
      shallow(<Asset />);
      
      expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('updates state when asset data changes', () => {
      const wrapper = shallow(<Asset />);
      
      // Start with no data
      expect(wrapper.find('[data-testid="fullpage-loader"]')).toHaveLength(1);
      
      // Update with ready asset
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          asset: {
            playback_id: 'test-playback-id',
            status: 'ready'
          }
        },
        error: null
      });
      
      wrapper.setProps({}); // Force re-render
      
      expect(Router.push).toHaveBeenCalledWith('/v/test-playback-id');
    });
  });
});