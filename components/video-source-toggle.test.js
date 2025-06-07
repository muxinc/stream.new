import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VideoSourceToggle from './video-source-toggle';

describe('VideoSourceToggle', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders toggle options', () => {
    render(<VideoSourceToggle activeSource="camera" onChange={mockOnChange} />);
    expect(screen.getByRole('button', { name: 'Camera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Screenshare' })).toBeInTheDocument();
  });

  it('handles source selection', () => {
    render(<VideoSourceToggle activeSource="camera" onChange={mockOnChange} />);
    
    const cameraButton = screen.getByRole('button', { name: 'Camera' });
    fireEvent.click(cameraButton);
    expect(mockOnChange).toHaveBeenCalledWith('camera');
  });

  it('displays source labels', () => {
    render(<VideoSourceToggle activeSource="camera" onChange={mockOnChange} />);
    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('Screenshare')).toBeInTheDocument();
  });

  it('applies selected state correctly', () => {
    render(<VideoSourceToggle activeSource="camera" onChange={mockOnChange} />);
    const cameraButton = screen.getByRole('button', { name: 'Camera' });
    expect(cameraButton).toHaveClass('active');
  });

  it('handles screen source selection', () => {
    render(<VideoSourceToggle activeSource="screen" onChange={mockOnChange} />);
    
    const screenButton = screen.getByRole('button', { name: 'Screenshare' });
    fireEvent.click(screenButton);
    expect(mockOnChange).toHaveBeenCalledWith('screen');
  });
});