import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccessSkeletonFrame from './access-skeleton-frame';

test('should render and handle button click', () => {
  const onClick = jest.fn();
  render(<AccessSkeletonFrame onClick={onClick} text="Click me" />);
  
  const button = screen.getByRole('button', { name: 'Click me' });
  expect(button).toBeInTheDocument();
  
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
});
