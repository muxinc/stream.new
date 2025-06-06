// @ts-nocheck
import React from 'react';
import { shallow, mount } from 'enzyme';
import Router from 'next/router';
import useSwr from 'swr';
import Cookies from 'js-cookie';
import Index from './index';

// Mock dependencies
jest.mock('next/router', () => ({
  push: jest.fn(),
  reload: jest.fn(),
}));

jest.mock('swr', () => jest.fn());

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

jest.mock('@mux/mux-uploader-react', () => ({
  __esModule: true,
  default: ({ children, onUploadStart, onSuccess, onUploadError, endpoint, ...props }) => (
    <div 
      data-testid="mux-uploader"
      data-upload-start={onUploadStart}
      data-success={onSuccess}
      data-error={onUploadError}
      data-endpoint={endpoint}
      {...props}
    >
      {children}
    </div>
  ),
}));

jest.mock('../components/layout', () => ({ children, dragActive, isUploading }) => (
  <div data-testid="layout" data-drag-active={dragActive} data-uploading={isUploading}>
    {children}
  </div>
));

jest.mock('../components/button', () => ({ children, className, onClick, slot }) => (
  <button 
    data-testid="button" 
    className={className} 
    onClick={onClick}
    data-slot={slot}
  >
    {children}
  </button>
));

jest.mock('../lib/telemetry', () => ({
  reportUploadTelemetry: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Index Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSwr as jest.Mock).mockReturnValue({ data: null });
    (Cookies.get as jest.Mock).mockReturnValue('false');
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ id: 'test-upload-id', url: 'test-url' }),
    });
  });

  describe('Initial Render', () => {
    it('renders main landing page with upload interface', () => {
      const wrapper = shallow(<Index />);
      
      expect(wrapper.find('[data-testid="layout"]')).toHaveLength(1);
      expect(wrapper.text()).toContain('Add a video');
      expect(wrapper.text()).toContain('Get a shareable link to stream it');
    });

    it('renders upload button and recording options when not uploading', () => {
      const wrapper = shallow(<Index />);
      
      expect(wrapper.find('[data-testid="mux-uploader"]')).toHaveLength(1);
      expect(wrapper.find('[data-slot="file-select"]')).toHaveLength(1);
      expect(wrapper.text()).toContain('Upload video');
      expect(wrapper.text()).toContain('Record from camera');
      expect(wrapper.text()).toContain('Record my screen');
    });

    it('shows drag and drop notice', () => {
      const wrapper = shallow(<Index />);
      
      expect(wrapper.text()).toContain('Drag & drop a video file anywhere');
    });
  });

  describe('Upload Functionality', () => {
    it('creates upload endpoint correctly', async () => {
      const wrapper = shallow(<Index />);
      const instance = wrapper.instance() as any;
      
      const result = await instance.createUpload();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/uploads', { method: 'POST' });
      expect(result).toBe('test-url');
    });

    it('handles upload creation errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const wrapper = shallow(<Index />);
      const instance = wrapper.instance() as any;
      
      await instance.createUpload();
      
      expect(wrapper.state('errorMessage')).toBe('Error creating upload.');
    });

    it('handles upload start event', () => {
      const wrapper = shallow(<Index />);
      const mockDetail = {
        file: { size: 1024000 },
        chunkSize: 8192,
      };
      
      const instance = wrapper.instance() as any;
      instance.handleUpload({ detail: mockDetail });
      
      expect(wrapper.state('isUploading')).toBe(true);
      expect(wrapper.state('uploadAnalytics')).toMatchObject({
        fileSize: 1024000,
        chunkSize: 8192,
        chunks: [],
      });
    });

    it('handles chunk upload tracking', () => {
      const wrapper = shallow(<Index />);
      wrapper.setState({
        uploadAnalytics: { chunks: [] }
      });
      
      const instance = wrapper.instance() as any;
      instance.handleChunkAttempt({ 
        detail: { chunkNumber: 0, chunkSize: 8192 }
      });
      
      const state = wrapper.state('uploadAnalytics') as any;
      expect(state.chunks[0]).toMatchObject({
        size: 8192,
        uploadStarted: expect.any(Number),
      });
    });

    it('handles chunk success', () => {
      const wrapper = shallow(<Index />);
      wrapper.setState({
        uploadAnalytics: { 
          chunks: [{ size: 8192, uploadStarted: Date.now() }] 
        }
      });
      
      const instance = wrapper.instance() as any;
      instance.handleChunkSuccess({ 
        detail: { chunk: 0, chunkSize: 8192 }
      });
      
      const state = wrapper.state('uploadAnalytics') as any;
      expect(state.chunks[0].uploadFinished).toBeDefined();
    });

    it('handles upload success', () => {
      const { reportUploadTelemetry } = require('../lib/telemetry');
      const wrapper = shallow(<Index />);
      wrapper.setState({
        uploadId: 'test-upload-id',
        uploadAnalytics: { chunks: [] }
      });
      
      const instance = wrapper.instance() as any;
      instance.handleSuccess();
      
      expect(wrapper.state('isPreparing')).toBe(true);
      expect(reportUploadTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          uploadFinished: expect.any(Number),
          uploadId: 'test-upload-id',
        })
      );
    });

    it('handles upload errors', () => {
      const { reportUploadTelemetry } = require('../lib/telemetry');
      const wrapper = shallow(<Index />);
      wrapper.setState({
        uploadId: 'test-upload-id',
        uploadAnalytics: { chunks: [] }
      });
      
      const instance = wrapper.instance() as any;
      instance.handleUploadError({ 
        detail: { message: 'Upload failed' }
      });
      
      expect(wrapper.state('isUploading')).toBe(false);
      expect(reportUploadTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          uploadErrored: true,
          message: 'Upload failed',
        })
      );
    });
  });

  describe('Upload Progress & Navigation', () => {
    it('polls for upload status when preparing', () => {
      const mockUseSwr = useSwr as jest.Mock;
      const wrapper = shallow(<Index />);
      wrapper.setState({ 
        isPreparing: true, 
        uploadId: 'test-upload-id' 
      });
      
      // Re-render to trigger useSwr
      wrapper.setProps({});
      
      expect(mockUseSwr).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        { refreshInterval: 5000 }
      );
    });

    it('redirects to asset page when upload is ready', () => {
      (useSwr as jest.Mock).mockReturnValue({
        data: {
          upload: { asset_id: 'test-asset-id' }
        }
      });
      
      shallow(<Index />);
      
      expect(Router.push).toHaveBeenCalledWith({
        pathname: '/assets/test-asset-id',
      });
    });

    it('handles dynamic chunk size from cookies', () => {
      (Cookies.get as jest.Mock).mockReturnValue('true');
      
      const wrapper = shallow(<Index />);
      
      expect(wrapper.state('isDynamicChunkSizeSet')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('displays error message when upload creation fails', () => {
      const wrapper = shallow(<Index />);
      wrapper.setState({ errorMessage: 'Upload failed' });
      
      expect(wrapper.text()).toContain('Upload failed');
      expect(wrapper.find('[data-testid="button"]').text()).toContain('Reset');
    });

    it('calls Router.reload when reset button is clicked', () => {
      const wrapper = shallow(<Index />);
      wrapper.setState({ errorMessage: 'Upload failed' });
      
      const resetButton = wrapper.find('[data-testid="button"]');
      resetButton.simulate('click');
      
      expect(Router.reload).toHaveBeenCalled();
    });
  });

  describe('UI State Changes', () => {
    it('updates layout props when uploading', () => {
      const wrapper = shallow(<Index />);
      wrapper.setState({ isUploading: true });
      
      const layout = wrapper.find('[data-testid="layout"]');
      expect(layout.prop('isUploading')).toBe(true);
    });

    it('hides upload button and shows progress when uploading', () => {
      const wrapper = shallow(<Index />);
      wrapper.setState({ isUploading: true });
      
      expect(wrapper.find('.hidden')).toHaveLength(1);
      expect(wrapper.text()).not.toContain('Add a video');
    });

    it('hides recording options when uploading', () => {
      const wrapper = shallow(<Index />);
      wrapper.setState({ isUploading: true });
      
      expect(wrapper.text()).not.toContain('Record from camera');
      expect(wrapper.text()).not.toContain('Record my screen');
    });
  });

  describe('Responsive Design', () => {
    it('includes responsive CSS for different screen sizes', () => {
      const wrapper = shallow(<Index />);
      
      const styles = wrapper.find('style').at(0).prop('children');
      expect(styles).toContain('@media only screen');
      expect(styles).toContain('.drop-notice');
      expect(styles).toContain('.cta-record');
    });
  });
});