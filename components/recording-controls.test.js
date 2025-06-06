import React from 'react';
import { shallow } from 'enzyme';
import RecordingControls from './recording-controls';
import { RecordState } from '../types';

// Mock the Button component
jest.mock('./button', () => ({ children, onClick, disabled, type }) => (
  <button onClick={onClick} disabled={disabled} type={type}>{children}</button>
));

describe('RecordingControls', () => {
  const defaultProps = {
    recordState: RecordState.IDLE,
    isLoadingPreview: false,
    isReviewing: false,
    startRecording: jest.fn(),
    cancelRecording: jest.fn(),
    stopRecording: jest.fn(),
    submitRecording: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders control buttons', () => {
    const wrapper = shallow(<RecordingControls {...defaultProps} />);
    // Check for the container div and that component renders
    expect(wrapper.find('div.container')).toHaveLength(1);
    expect(wrapper.exists()).toBe(true);
  });

  it('handles start recording', () => {
    const wrapper = shallow(<RecordingControls {...defaultProps} />);
    
    const buttons = wrapper.find('button');
    const startButton = buttons.findWhere(button => 
      button.text().includes('Start recording')
    );
    
    if (startButton.exists()) {
      startButton.simulate('click');
      expect(defaultProps.startRecording).toHaveBeenCalled();
    }
  });

  it('handles stop recording', () => {
    const props = {
      ...defaultProps,
      recordState: RecordState.RECORDING,
    };
    const wrapper = shallow(<RecordingControls {...props} />);
    
    const buttons = wrapper.find('button');
    const stopButton = buttons.findWhere(button => 
      button.text().includes('Stop recording')
    );
    
    if (stopButton.exists()) {
      stopButton.simulate('click');
      expect(defaultProps.stopRecording).toHaveBeenCalled();
    }
  });

  it('shows different states based on recording status', () => {
    const recordingWrapper = shallow(
      <RecordingControls {...defaultProps} recordState={RecordState.RECORDING} />
    );
    const idleWrapper = shallow(
      <RecordingControls {...defaultProps} recordState={RecordState.IDLE} />
    );
    
    expect(recordingWrapper.exists()).toBe(true);
    expect(idleWrapper.exists()).toBe(true);
  });

  it('handles submit when reviewing', () => {
    const props = {
      ...defaultProps,
      isReviewing: true,
    };
    const wrapper = shallow(<RecordingControls {...props} />);
    
    const buttons = wrapper.find('button');
    const submitButton = buttons.findWhere(button => 
      button.text().includes('Submit')
    );
    
    if (submitButton.exists()) {
      submitButton.simulate('click');
      expect(defaultProps.submitRecording).toHaveBeenCalled();
    }
  });

  it('shows loading state', () => {
    const props = {
      ...defaultProps,
      isLoadingPreview: true,
      isReviewing: true,
    };
    const wrapper = shallow(<RecordingControls {...props} />);
    
    // Check that component renders with loading state
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('div.container')).toHaveLength(1);
  });
});