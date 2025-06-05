import React from 'react';
import { shallow, mount } from 'enzyme';
import PlayerPage from './player-page';
import MuxPlayer from './mux-player';
import PlyrPlayer from './plyr-player';
import WinampPlayer from './winamp-player';
import { mockRouter } from '../test/test-utils';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      status: 'ready',
      playback_ids: [{ id: 'test-playback-id', policy: 'public' }],
      aspect_ratio: '16:9',
      duration: 120,
    },
    error: null,
    isValidating: false,
  })),
}));

describe('PlayerPage', () => {
  beforeEach(() => {
    mockRouter.query = {
      id: 'test-playback-id',
      time: '10',
      color: 'ff0000',
    };
    mockRouter.asPath = '/v/test-playback-id?time=10&color=ff0000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when asset is loading', () => {
    const swr = require('swr').default;
    swr.mockReturnValue({
      data: null,
      error: null,
      isValidating: true,
    });

    const wrapper = shallow(<PlayerPage playbackId="test-playback-id" />);
    expect(wrapper.find('PlayerLoader').exists()).toBe(true);
  });

  it('renders error state when asset fails to load', () => {
    const swr = require('swr').default;
    swr.mockReturnValue({
      data: null,
      error: new Error('Failed to load'),
      isValidating: false,
    });

    const wrapper = shallow(<PlayerPage playbackId="test-playback-id" />);
    expect(wrapper.find('ErrorMessage').exists()).toBe(true);
  });

  it('renders MuxPlayer by default', () => {
    const wrapper = shallow(<PlayerPage playbackId="test-playback-id" />);
    expect(wrapper.find(MuxPlayer).exists()).toBe(true);
  });

  it('renders PlyrPlayer when playerType is plyr', () => {
    const wrapper = shallow(
      <PlayerPage playbackId="test-playback-id" playerType="plyr" />
    );
    expect(wrapper.find(PlyrPlayer).exists()).toBe(true);
  });

  it('renders WinampPlayer when playerType is winamp', () => {
    const wrapper = shallow(
      <PlayerPage playbackId="test-playback-id" playerType="winamp" />
    );
    expect(wrapper.find(WinampPlayer).exists()).toBe(true);
  });

  it('passes correct props to player components', () => {
    const wrapper = shallow(<PlayerPage playbackId="test-playback-id" />);
    const player = wrapper.find(MuxPlayer);

    expect(player.prop('playbackId')).toBe('test-playback-id');
    expect(player.prop('startTime')).toBe(10);
    expect(player.prop('primaryColor')).toBe('#ff0000');
    expect(player.prop('asset')).toBeDefined();
  });

  it('handles invalid start time gracefully', () => {
    mockRouter.query.time = 'invalid';
    const wrapper = shallow(<PlayerPage playbackId="test-playback-id" />);
    const player = wrapper.find(MuxPlayer);

    expect(player.prop('startTime')).toBe(0);
  });

  it('handles missing color parameter', () => {
    delete mockRouter.query.color;
    const wrapper = shallow(<PlayerPage playbackId="test-playback-id" />);
    const player = wrapper.find(MuxPlayer);

    expect(player.prop('primaryColor')).toBeUndefined();
  });

  it('shows share button and handles copy', () => {
    const wrapper = mount(<PlayerPage playbackId="test-playback-id" />);
    const shareButton = wrapper.find('button.share-button');

    expect(shareButton.exists()).toBe(true);
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(true),
      },
    });

    shareButton.simulate('click');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('test-playback-id')
    );
  });

  it('shows report button and opens modal', () => {
    const wrapper = mount(<PlayerPage playbackId="test-playback-id" />);
    const reportButton = wrapper.find('button.report-button');

    expect(reportButton.exists()).toBe(true);
    
    reportButton.simulate('click');
    wrapper.update();
    
    expect(wrapper.find('ReportForm').exists()).toBe(true);
  });

  it('renders in embed mode correctly', () => {
    const wrapper = shallow(
      <PlayerPage playbackId="test-playback-id" isEmbed={true} />
    );
    
    expect(wrapper.hasClass('embed-mode')).toBe(true);
    expect(wrapper.find('.share-button').exists()).toBe(false);
    expect(wrapper.find('.report-button').exists()).toBe(false);
  });

  it('handles asset with no playback IDs', () => {
    const swr = require('swr').default;
    swr.mockReturnValue({
      data: {
        status: 'ready',
        playback_ids: [],
      },
      error: null,
      isValidating: false,
    });

    const wrapper = shallow(<PlayerPage playbackId="test-playback-id" />);
    expect(wrapper.find('ErrorMessage').exists()).toBe(true);
  });

  it('handles asset still processing', () => {
    const swr = require('swr').default;
    swr.mockReturnValue({
      data: {
        status: 'preparing',
        playback_ids: [{ id: 'test-playback-id', policy: 'public' }],
      },
      error: null,
      isValidating: false,
    });

    const wrapper = shallow(<PlayerPage playbackId="test-playback-id" />);
    expect(wrapper.find('PlayerLoader').exists()).toBe(true);
    expect(wrapper.find('.processing-message').text()).toContain('processing');
  });
});