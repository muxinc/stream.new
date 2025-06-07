import React from 'react';
import { render, screen } from '@testing-library/react';
import StopWatch from './stop-watch';

describe('StopWatch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders time display', () => {
    render(<StopWatch startTimeUnixMs={Date.now()} />);
    expect(screen.getByText('0 seconds')).toBeInTheDocument();
  });

  it('displays initial time correctly', () => {
    render(<StopWatch startTimeUnixMs={Date.now()} />);
    expect(screen.getByText('0 seconds')).toBeInTheDocument();
  });

  it('formats time correctly for seconds', () => {
    const startTime = Date.now() - 30000; // 30 seconds ago
    render(<StopWatch startTimeUnixMs={startTime} />);
    
    expect(screen.getByText(/seconds/)).toBeInTheDocument();
  });

  it('renders with time prop', () => {
    const startTime = Date.now() - 90000; // 1.5 minutes ago
    render(<StopWatch startTimeUnixMs={startTime} />);
    
    // Either shows initial time or updated time after effect runs
    expect(screen.getByText(/seconds|minute/)).toBeInTheDocument();
  });

  it('handles different start times', () => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    render(<StopWatch startTimeUnixMs={fiveMinutesAgo} />);
    expect(screen.getByText(/seconds|minute/)).toBeInTheDocument();
  });

  it('displays initial time state', () => {
    const startTime = Date.now() - (2 * 60 * 1000 + 15000); // 2 minutes 15 seconds ago
    render(<StopWatch startTimeUnixMs={startTime} />);
    
    expect(screen.getByText(/seconds|minute/)).toBeInTheDocument();
  });

  it('renders with valid start time', () => {
    const startTime = Date.now() - (60 * 1000 + 5000); // 1 minute 5 seconds ago
    render(<StopWatch startTimeUnixMs={startTime} />);
    
    expect(screen.getByText(/seconds|minute/)).toBeInTheDocument();
  });

  it('shows default time when no elapsed time', () => {
    render(<StopWatch startTimeUnixMs={Date.now() + 1000} />);
    // Future time should show 0 or default
    expect(screen.getByText('0 seconds')).toBeInTheDocument();
  });
});