// Global Jest setup file

// TextEncoder/TextDecoder polyfills for jsdom environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

// Stream polyfills for jsdom environment
try {
  const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
  global.ReadableStream = global.ReadableStream || ReadableStream;
  global.WritableStream = global.WritableStream || WritableStream;
  global.TransformStream = global.TransformStream || TransformStream;
} catch (e) {
  // Fallback for older Node versions or environments
  if (!global.ReadableStream) {
    global.ReadableStream = class ReadableStream {};
    global.WritableStream = class WritableStream {};
    global.TransformStream = class TransformStream {};
  }
}

// Only set up DOM-specific mocks in jsdom environment
if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock MediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: jest.fn(),
      getDisplayMedia: jest.fn(),
      enumerateDevices: jest.fn(),
    },
  });

  // Mock MediaRecorder
  global.MediaRecorder = jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    state: 'inactive',
  }));
}

// Mock fetch globally (works in both node and jsdom)
global.fetch = jest.fn();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_MUX_ENV_KEY = 'test-mux-env-key';

// Global timeout for tests
jest.setTimeout(30000);