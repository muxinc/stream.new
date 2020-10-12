import { shallow } from 'enzyme';
import AccessSkeletonFrame from './access-skeleton-frame';
import Button from './button';

test('should render', () => {
  const onClick = jest.fn();
  const wrapper = shallow(<AccessSkeletonFrame onClick={onClick} />);
  wrapper.find(Button).simulate('click');
  expect(onClick.mock.calls.length).toEqual(1);
});
