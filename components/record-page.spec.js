import { shallow } from 'enzyme';
import RecordPage from './record-page';
import VideoSourceToggle from './video-source-toggle';
import StopWatch from './stop-watch';

test('should render with a video source toggle component', () => {
  const wrapper = shallow(<RecordPage />);
  expect(wrapper.find(VideoSourceToggle).length).toEqual(1);
});

test('should render basic structure', () => {
  const wrapper = shallow(<RecordPage />);
  // Just test that the component renders without crashing
  expect(wrapper.find('h1').length).toBeGreaterThan(0);
});
