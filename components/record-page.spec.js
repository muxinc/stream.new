import { render } from '@testing-library/react';
import RecordPage from './record-page';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: jest.fn(),
  }),
}));

// Mock browser media APIs
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(),
    enumerateDevices: jest.fn(() => Promise.resolve([])),
    ondevicechange: null,
  },
});

test('should render without crashing', () => {
  const { container } = render(<RecordPage />);
  expect(container).toBeTruthy();
});
