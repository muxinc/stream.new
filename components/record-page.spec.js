import React from 'react';
import { render, screen } from '@testing-library/react';
import RecordPage from './record-page';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/',
    route: '/',
    asPath: '/',
  }),
}));

// Mock complex dependencies
jest.mock('./video-source-toggle', () => {
  return function MockVideoSourceToggle({ activeSource, onChange }) {
    return <div data-testid="video-source-toggle">Video Source Toggle</div>;
  };
});

jest.mock('./stop-watch', () => {
  return function MockStopWatch({ startTimeUnixMs }) {
    return <div data-testid="stop-watch">Stop Watch</div>;
  };
});

test('should render with a video source toggle component', () => {
  render(<RecordPage />);
  expect(screen.getByTestId('video-source-toggle')).toBeInTheDocument();
});

test('should render basic structure', () => {
  render(<RecordPage />);
  // Just test that the component renders without crashing
  const headings = screen.getAllByRole('heading');
  expect(headings.length).toBeGreaterThan(0);
});
