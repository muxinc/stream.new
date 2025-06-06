// @ts-nocheck
import React from 'react';
import { shallow, mount } from 'enzyme';

// Mock Next.js router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  query: {},
  pathname: '/',
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
};

// Mock Next.js useRouter hook
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Helper to create component with router context
export function createRouterWrapper(router = mockRouter) {
  return ({ children }) => (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
}

// Custom render function for components that need router
export function renderWithRouter(component, options = {}) {
  const { router = mockRouter, ...renderOptions } = options;
  
  return {
    ...mount(component, {
      wrappingComponent: createRouterWrapper(router),
      ...renderOptions,
    }),
    router,
  };
}

// Mock window.MediaRecorder
export const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  ondataavailable: jest.fn(),
  onstop: jest.fn(),
  onerror: jest.fn(),
  state: 'inactive',
};

// Mock navigator.mediaDevices
export const mockMediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [],
    getVideoTracks: () => [],
    getAudioTracks: () => [],
  }),
  getDisplayMedia: jest.fn().mockResolvedValue({
    getTracks: () => [],
    getVideoTracks: () => [],
    getAudioTracks: () => [],
  }),
  enumerateDevices: jest.fn().mockResolvedValue([]),
};

// Setup media mocks
export function setupMediaMocks() {
  global.MediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);
  global.MediaRecorder.isTypeSupported = jest.fn().mockReturnValue(true);
  global.navigator.mediaDevices = mockMediaDevices;
  
  // Mock window.URL.createObjectURL
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
}

// Mock SWR hook
export function mockSWR(data, error = null, isValidating = false) {
  return {
    data,
    error,
    isValidating,
    mutate: jest.fn(),
  };
}

// Helper to wait for async updates
export const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

// Helper to find elements by test id
export function findByTestId(wrapper, testId) {
  return wrapper.find(`[data-testid="${testId}"]`);
}

// Mock fetch responses
export function mockFetch(response) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

// Mock failed fetch
export function mockFetchError(status = 500, message = 'Internal Server Error') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: message,
    json: async () => ({ error: message }),
    text: async () => message,
  });
}

// Clean up all mocks
export function cleanupMocks() {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  if (global.fetch) {
    global.fetch.mockRestore();
  }
}