import '@testing-library/jest-dom';
import dotenv from 'dotenv';
import '@mux/mux-node/shims/node'

// Browser environment polyfills
if (typeof window !== 'undefined') {
  import('whatwg-fetch');
} else {
  // Node environment polyfills
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = global.TextEncoder || TextEncoder;
  global.TextDecoder = global.TextDecoder || TextDecoder;
  
  // Try to polyfill streams if available
  try {
    const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
    global.ReadableStream = global.ReadableStream || ReadableStream;
    global.WritableStream = global.WritableStream || WritableStream;
    global.TransformStream = global.TransformStream || TransformStream;
  } catch (e) {
    // Fallback for older Node versions
    if (!global.ReadableStream) {
      global.ReadableStream = class ReadableStream {};
      global.WritableStream = class WritableStream {};
      global.TransformStream = class TransformStream {};
    }
  }
}

dotenv.config({ path: '.env.test' });
