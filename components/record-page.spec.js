import { render, screen } from '@testing-library/react';
import RecordPage from './record-page';

// Mock Next.js App Router navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => 'camera'), // Default to camera source
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

describe('RecordPage', () => {
  test('should render without crashing', () => {
    const { container } = render(<RecordPage />);
    expect(container).toBeTruthy();
  });

  test('should show "Video setup" heading when not recording', () => {
    render(<RecordPage />);
    expect(screen.getByRole('heading', { name: 'Video setup' })).toBeInTheDocument();
  });

  test('should render video source toggle', () => {
    render(<RecordPage />);
    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('Screenshare')).toBeInTheDocument();
  });

  test('should show access prompt when device access not granted', () => {
    render(<RecordPage />);
    expect(screen.getByText('Allow the browser to use your camera/mic')).toBeInTheDocument();
  });
});
