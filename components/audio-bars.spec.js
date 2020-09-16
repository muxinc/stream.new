import { shallow } from 'enzyme';
import AudioBars from './audio-bars';

test('should render the right number of bars', () => {
  const wrapper = shallow(<AudioBars />);
  expect(wrapper.find('.level').length).toEqual(6);
});

test('should render 3 active bars when the audio level is 11', () => {
  const wrapper = shallow(<AudioBars audioLevel={11} />);
  expect(wrapper.find('.level.active').length).toEqual(3);
});
