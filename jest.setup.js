import '@testing-library/jest-dom';

// Polyfills for jsdom and MSW compatibility
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Additional Node.js polyfills for MSW
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = class TransformStream {
    constructor() {
      this.readable = {};
      this.writable = {};
    }
  };
}

if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(name) {
      this.name = name;
    }
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
    close() {}
  };
}

// Polyfills for fetch API in Node.js environment
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch');
  global.Headers = require('node-fetch').Headers;
  global.Request = require('node-fetch').Request;
  global.Response = require('node-fetch').Response;
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}));

// Mock window.matchMedia for theme provider
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

// Mock JWT decode for authentication tests
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.mockUser = {
  id: "7c1f6482-60aa-4be0-9a09-53fe5493c28f",
  email: "testuser@example.com",
  firstName: "Test",
  lastName: "User",
  platformRole: "TENANT_OWNER",
  tenantId: "b81a4784-a02b-4782-91b5-481ce8f225d8",
  emailVerified: true,
  createdAt: "2025-09-07T10:24:38.368626",
  updatedAt: "2025-09-07T10:24:38.368626"
};

// Setup MSW for tests - temporarily disabled due to polyfill issues
// import './__tests__/setup/msw-server'

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});