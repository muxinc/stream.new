import React from 'react';
import { shallow, mount } from 'enzyme';
import UploadPage from './upload-page';
import DragOverlay from './drag-overlay';
import { mockRouter } from '../test/test-utils';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

jest.mock('@mux/mux-uploader-react', () => ({
  __esModule: true,
  default: ({ onSuccess, onError, children }) => (
    <div className="mock-mux-uploader" data-onsuccess={onSuccess} data-onerror={onError}>
      {children}
    </div>
  ),
}));

jest.mock('../lib/telemetry', () => ({
  trackEvent: jest.fn(),
}));

describe('UploadPage', () => {
  let trackEvent;

  beforeEach(() => {
    trackEvent = require('../lib/telemetry').trackEvent;
    mockRouter.push.mockClear();
    trackEvent.mockClear();
  });

  it('renders upload interface', () => {
    const wrapper = shallow(<UploadPage />);
    
    expect(wrapper.find('h1').text()).toBe('Upload a video');
    expect(wrapper.find('MuxUploader').exists()).toBe(true);
    expect(wrapper.find('button').text()).toContain('Select a video');
  });

  it('shows loading state during upload creation', () => {
    const wrapper = shallow(<UploadPage />);
    wrapper.setState({ isLoading: true });
    
    expect(wrapper.find('Spinner').exists()).toBe(true);
  });

  it('handles successful upload', () => {
    const wrapper = mount(<UploadPage />);
    const muxUploader = wrapper.find('.mock-mux-uploader');
    const onSuccess = muxUploader.prop('data-onsuccess');
    
    const mockDetail = {
      uploadId: 'test-upload-id',
    };
    
    onSuccess({ detail: mockDetail });
    
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/assets/[id]',
      query: { id: 'test-upload-id' },
    });
    
    expect(trackEvent).toHaveBeenCalledWith('upload_success', {
      uploadId: 'test-upload-id',
    });
  });

  it('handles upload errors', () => {
    const wrapper = mount(<UploadPage />);
    const muxUploader = wrapper.find('.mock-mux-uploader');
    const onError = muxUploader.prop('data-onerror');
    
    const mockError = {
      detail: {
        message: 'Upload failed',
      },
    };
    
    onError(mockError);
    
    expect(trackEvent).toHaveBeenCalledWith('upload_error', {
      error: 'Upload failed',
    });
    
    wrapper.update();
    expect(wrapper.find('.error-message').exists()).toBe(true);
  });

  it('handles drag and drop', () => {
    const wrapper = shallow(<UploadPage />);
    
    // Test drag enter
    wrapper.simulate('dragenter', { preventDefault: jest.fn() });
    expect(wrapper.state('isDragging')).toBe(true);
    expect(wrapper.find(DragOverlay).exists()).toBe(true);
    
    // Test drag leave
    wrapper.simulate('dragleave', { preventDefault: jest.fn() });
    expect(wrapper.state('isDragging')).toBe(false);
    expect(wrapper.find(DragOverlay).exists()).toBe(false);
  });

  it('prevents default drag behavior', () => {
    const wrapper = shallow(<UploadPage />);
    const preventDefault = jest.fn();
    
    wrapper.simulate('dragover', { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });

  it('handles file drop', () => {
    const wrapper = shallow(<UploadPage />);
    const preventDefault = jest.fn();
    const files = [new File(['video content'], 'test.mp4', { type: 'video/mp4' })];
    
    wrapper.setState({ isDragging: true });
    wrapper.simulate('drop', {
      preventDefault,
      dataTransfer: { files },
    });
    
    expect(preventDefault).toHaveBeenCalled();
    expect(wrapper.state('isDragging')).toBe(false);
  });

  it('configures MuxUploader with correct endpoint', () => {
    const wrapper = shallow(<UploadPage />);
    const muxUploader = wrapper.find('MuxUploader');
    
    expect(muxUploader.prop('endpoint')).toBe('/api/uploads');
  });

  it('tracks telemetry on mount', () => {
    mount(<UploadPage />);
    
    expect(trackEvent).toHaveBeenCalledWith('upload_page_view', {});
  });

  it('cleans up on unmount', () => {
    const wrapper = mount(<UploadPage />);
    const instance = wrapper.instance();
    
    // Spy on cleanup methods if any
    if (instance.cleanup) {
      const cleanupSpy = jest.spyOn(instance, 'cleanup');
      wrapper.unmount();
      expect(cleanupSpy).toHaveBeenCalled();
    }
  });
});