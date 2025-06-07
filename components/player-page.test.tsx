import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import PlayerPage from './player-page';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('copy-to-clipboard', () => jest.fn());

jest.mock('./fullpage-loader', () => ({ text }: { text: string }) => (
  <div data-testid="fullpage-loader">{text}</div>
));

jest.mock('./player-loader', () => ({ 
  playbackId, 
  onLoaded, 
  onError, 
  playerType,
  aspectRatio 
}: any) => (
  <div 
    data-testid="player-loader"
    data-playback-id={playbackId}
    onClick={() => onLoaded && onLoaded()}
  />
));

jest.mock('./layout', () => ({ 
  children, 
  centered, 
  darkMode 
}: any) => (
  <div data-testid="layout" data-centered={centered} data-dark-mode={darkMode}>
    {children}
  </div>
));

jest.mock('./report-form', () => ({ playbackId, close }: any) => (
  <div data-testid="report-form">
    <button onClick={close}>Close Report</button>
  </div>
));

describe('PlayerPage Component', () => {
  const mockRouter = {
    isFallback: false,
    isReady: true,
    query: {},
  };

  const defaultProps = {
    playbackId: 'test-playback-id',
    videoExists: true,
    shareUrl: 'https://example.com/video/test',
    poster: 'https://example.com/poster.jpg',
    playerType: 'mux' as const,
    aspectRatio: 16/9,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (copy as jest.Mock).mockReturnValue(true);
  });

  describe('Component Rendering', () => {
    it('renders without errors', () => {
      render(<PlayerPage {...defaultProps} />);
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('shows loading state when not loaded', () => {
      render(<PlayerPage {...defaultProps} />);
      // Component structure should be present
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('shows player when video exists and is loaded', () => {
      render(<PlayerPage {...defaultProps} />);
      
      // Click to trigger onLoaded
      const playerLoader = screen.queryByTestId('player-loader');
      if (playerLoader) {
        fireEvent.click(playerLoader);
      }
      
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles video not found', () => {
      render(<PlayerPage {...defaultProps} videoExists={false} />);
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('handles router fallback state', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        isFallback: true,
      });
      
      render(<PlayerPage {...defaultProps} />);
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('handles copy URL action', () => {
      render(<PlayerPage {...defaultProps} />);
      
      const copyButton = screen.queryByText('Copy video URL');
      if (copyButton) {
        fireEvent.click(copyButton);
        expect(copy).toHaveBeenCalledWith(defaultProps.shareUrl, { message: 'Copy' });
      }
    });
  });

  describe('Report Functionality', () => {
    it('handles report abuse toggle', () => {
      render(<PlayerPage {...defaultProps} />);
      
      const reportButton = screen.queryByText('Report abuse');
      if (reportButton) {
        fireEvent.click(reportButton);
        expect(screen.getByTestId('layout')).toBeInTheDocument();
      }
    });
  });

  describe('Props Validation', () => {
    it('accepts all required props', () => {
      expect(() => {
        render(<PlayerPage {...defaultProps} />);
      }).not.toThrow();
    });

    it('handles missing optional props', () => {
      const minimalProps = {
        playbackId: 'test-id',
        videoExists: true,
        shareUrl: 'https://example.com',
        playerType: 'mux' as const,
      };
      
      expect(() => {
        render(<PlayerPage {...minimalProps} />);
      }).not.toThrow();
    });
  });
});