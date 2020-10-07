import { shallow } from 'enzyme';
import RecordPage from './record-page';
import VideoSourceToggle from './video-source-toggle';

test('should render with a video source toggle component', () => {
  const wrapper = shallow(<RecordPage />);
  expect(wrapper.find(VideoSourceToggle).length).toEqual(1);
});
