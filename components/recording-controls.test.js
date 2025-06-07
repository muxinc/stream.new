import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecordingControls from './recording-controls';
import { RecordState } from '../types';

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
    render(<RecordingControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Start recording' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('handles start recording', () => {
    render(<RecordingControls {...defaultProps} />);
    
    const startButton = screen.getByRole('button', { name: 'Start recording' });
    fireEvent.click(startButton);
    expect(defaultProps.startRecording).toHaveBeenCalled();
  });

  it('handles stop recording', () => {
    const props = {
      ...defaultProps,
      recordState: RecordState.RECORDING,
    };
    render(<RecordingControls {...props} />);
    
    const stopButton = screen.getByRole('button', { name: 'Stop recording' });
    fireEvent.click(stopButton);
    expect(defaultProps.stopRecording).toHaveBeenCalled();
  });

  it('shows different states based on recording status', () => {
    const { rerender } = render(<RecordingControls {...defaultProps} recordState={RecordState.IDLE} />);
    expect(screen.getByRole('button', { name: 'Start recording' })).toBeInTheDocument();
    
    rerender(<RecordingControls {...defaultProps} recordState={RecordState.RECORDING} />);
    expect(screen.getByRole('button', { name: 'Stop recording' })).toBeInTheDocument();
  });

  it('handles submit when reviewing', () => {
    const props = {
      ...defaultProps,
      isReviewing: true,
    };
    render(<RecordingControls {...props} />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);
    expect(defaultProps.submitRecording).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const props = {
      ...defaultProps,
      isLoadingPreview: true,
      isReviewing: true,
    };
    render(<RecordingControls {...props} />);
    
    expect(screen.getByRole('button', { name: 'Loading preview...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});