import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorMessage from './error-message';

describe('ErrorMessage', () => {
  it('renders error message text', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with default styling', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveClass('message');
  });

  it('handles empty message', () => {
    render(<ErrorMessage message="" />);
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Unknown error')).toBeInTheDocument();
  });

  it('renders default error for undefined message', () => {
    render(<ErrorMessage />);
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Unknown error')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<ErrorMessage message="Test error" />);
    const messageElement = screen.getByTestId('error-message');
    expect(messageElement).toHaveClass('message');
    expect(messageElement).toBeInTheDocument();
  });
});