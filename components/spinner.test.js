import React from 'react';
import { render, screen } from '@testing-library/react';
import Spinner from './spinner';

describe('Spinner', () => {
  it('renders spinner element', () => {
    render(<Spinner />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner');
  });

  it('renders with custom props', () => {
    render(<Spinner size={8} color="#ff0000" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner');
  });

  it('handles different sizes', () => {
    const { rerender } = render(<Spinner size={4} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    
    rerender(<Spinner size={10} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});