import { render } from '@testing-library/react';
import AudioBars from './audio-bars';

test('should render the right number of bars', () => {
  const { container } = render(<AudioBars audioLevel={0} isMuted={false} muteAudioTrack={() => {}} />);
  const bars = container.querySelectorAll('.level');
  expect(bars.length).toEqual(6);
});

test('should render 3 active bars when the audio level is 11', () => {
  const { container } = render(<AudioBars audioLevel={11} isMuted={false} muteAudioTrack={() => {}} />);
  const activeBars = container.querySelectorAll('.level.active');
  expect(activeBars.length).toEqual(3);
});
