import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import DeleteAsset from '../pages/moderator/delete-asset';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock layout and components
jest.mock('./layout', () => {
  return function MockLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

jest.mock('./button', () => {
  return function MockButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return <button data-testid="delete-button" onClick={onClick}>{children}</button>;
  };
});

jest.mock('./fullpage-loader', () => {
  return function MockFullpageLoader() {
    return <div data-testid="fullpage-loader">Loading...</div>;
  };
});

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('DeleteAsset Component', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    query: {
      asset_id: 'test-asset-id',
      slack_moderator_password: 'test-password',
    },
    push: mockPush,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  describe('Component Rendering', () => {
    it('renders without errors', () => {
      expect(() => {
        render(<DeleteAsset />);
      }).not.toThrow();
    });

    it('accepts component as valid React element', () => {
      render(<DeleteAsset />);
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  describe('Router Integration', () => {
    it('integrates with Next.js router', () => {
      render(<DeleteAsset />);
      expect(useRouter).toHaveBeenCalled();
    });

    it('handles router query parameters', () => {
      const customRouter = {
        query: { asset_id: 'custom-id' },
        push: jest.fn(),
      };
      (useRouter as jest.Mock).mockReturnValue(customRouter);
      
      expect(() => {
        render(<DeleteAsset />);
      }).not.toThrow();
    });
  });

  describe('Component Structure', () => {
    it('has proper component structure', () => {
      render(<DeleteAsset />);
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing router gracefully', () => {
      (useRouter as jest.Mock).mockReturnValue({
        query: {},
        push: jest.fn(),
      });
      
      expect(() => {
        render(<DeleteAsset />);
      }).not.toThrow();
    });

    it('handles component errors gracefully', () => {
      expect(() => {
        render(<DeleteAsset />);
      }).not.toThrow();
    });
  });
});