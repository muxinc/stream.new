import React from 'react';
import { render, screen } from '@testing-library/react';
import AudioBars from './audio-bars';

test('should render the right number of bars', () => {
  render(<AudioBars />);
  const bars = screen.getAllByTestId(/audio-level-/);
  expect(bars).toHaveLength(6);
});

test('should render 3 active bars when the audio level is 11', () => {
  render(<AudioBars audioLevel={11} />);
  const activeBars = screen.getAllByTestId(/audio-level-/).filter(bar => 
    bar.classList.contains('active')
  );
  expect(activeBars).toHaveLength(3);
});
