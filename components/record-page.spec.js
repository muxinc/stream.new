import { shallow } from 'enzyme';
import RecordPage from './record-page';
import Button from './button';

test('should render with a button to allow access', () => {
  const wrapper = shallow(<RecordPage />);
  expect(wrapper.find(Button).length).toEqual(1);
});
