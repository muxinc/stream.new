import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccessSkeletonFrame from './access-skeleton-frame';

test('should render and handle click', async () => {
  const onClick = jest.fn();
  const user = userEvent.setup();
  render(<AccessSkeletonFrame onClick={onClick} text="Click me" />);

  const button = screen.getByRole('button', { name: 'Click me' });
  await user.click(button);

  expect(onClick).toHaveBeenCalledTimes(1);
});
