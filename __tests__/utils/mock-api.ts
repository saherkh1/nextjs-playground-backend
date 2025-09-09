import { createMockUser, createMockApiResponse } from './test-utils';

// Create actual mock implementations for the API
export const createMockApi = () => ({
  users: {
    getMe: jest.fn(),
    updateMe: jest.fn(),
  },
  auth: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    verifyEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    resendVerification: jest.fn(),
  },
  tenants: {
    getMe: jest.fn(),
    updateMe: jest.fn(),
  },
});

// Mock the entire API module
jest.mock('@/lib/api', () => ({
  api: createMockApi(),
}));

export const mockApi = createMockApi();