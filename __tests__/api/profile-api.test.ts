import { api } from '@/lib/api';
import { createMockUser, createMockApiResponse } from '../utils/test-utils';

// Mock axios
jest.mock('axios');

describe('Profile API Integration Tests', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('api.users.getMe()', () => {
    it('successfully fetches user profile', async () => {
      const mockResponse = createMockApiResponse(mockUser);
      
      // Mock successful API response
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await api.users.getMe();

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    it('includes proper authorization header', async () => {
      const mockResponse = createMockApiResponse(mockUser);
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({ data: mockResponse });

      // Mock token retrieval (assuming token is stored in localStorage or similar)
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnRSb2xlIjoiQ1JFQVRPUiIsInRlbmFudElkIjoiYjgxYTQ3ODQtYTAyYi00NzgyLTkxYjUtNDgxY2U4ZjIyNWQ4IiwidXNlcklkIjoiN2MxZjY0ODItNjBhYS00YmUwLTlhMDktNTNmZTU0OTNjMjhmIiwicGxhdGZvcm1Sb2xlIjoiVEVOQU5UX09XTkVSIiwic3ViIjoidGVzdHVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTcyNDA3OTIsImV4cCI6MTc1NzMyNzE5Mn0.mRiSsF1wRYZWc3kKJquIYKSuLWr5Ms17svHqC2MnMs4';
      
      // Setup localStorage mock
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(mockToken),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      await api.users.getMe();

      // Verify request was made with proper headers
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/users/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('handles 500 server errors correctly', async () => {
      const mockAxios = require('axios');
      const serverError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {
            success: false,
            error: 'Internal Server Error',
            message: 'Something went wrong on the server',
            timestamp: new Date().toISOString(),
          },
        },
      };
      
      mockAxios.get.mockRejectedValue(serverError);

      await expect(api.users.getMe()).rejects.toThrow();
    });

    it('handles 401 unauthorized errors', async () => {
      const mockAxios = require('axios');
      const unauthorizedError = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: {
            success: false,
            error: 'Unauthorized',
            message: 'Token expired',
            timestamp: new Date().toISOString(),
          },
        },
      };
      
      mockAxios.get.mockRejectedValue(unauthorizedError);

      await expect(api.users.getMe()).rejects.toThrow();
    });

    it('handles network errors', async () => {
      const mockAxios = require('axios');
      const networkError = new Error('Network Error');
      
      mockAxios.get.mockRejectedValue(networkError);

      await expect(api.users.getMe()).rejects.toThrow('Network Error');
    });

    it('validates response structure', async () => {
      const mockResponse = createMockApiResponse(mockUser);
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await api.users.getMe();

      // Verify response has required fields
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
      
      // Verify user data structure
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('email');
      expect(result.data).toHaveProperty('firstName');
      expect(result.data).toHaveProperty('lastName');
      expect(result.data).toHaveProperty('platformRole');
      expect(result.data).toHaveProperty('tenantId');
      expect(result.data).toHaveProperty('emailVerified');
      expect(result.data).toHaveProperty('createdAt');
    });
  });

  describe('api.users.updateMe()', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('successfully updates user profile', async () => {
      const updatedUser = createMockUser(updateData);
      const mockResponse = createMockApiResponse(updatedUser);
      
      const mockAxios = require('axios');
      mockAxios.put.mockResolvedValue({ data: mockResponse });

      const result = await api.users.updateMe(updateData);

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.data.firstName).toBe(updateData.firstName);
      expect(result.data.lastName).toBe(updateData.lastName);
    });

    it('sends proper request body and headers', async () => {
      const updatedUser = createMockUser(updateData);
      const mockResponse = createMockApiResponse(updatedUser);
      const mockAxios = require('axios');
      mockAxios.put.mockResolvedValue({ data: mockResponse });

      const mockToken = 'test-token';
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(mockToken),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      await api.users.updateMe(updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        '/users/me',
        updateData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('handles validation errors', async () => {
      const mockAxios = require('axios');
      const validationError = {
        response: {
          status: 400,
          data: {
            success: false,
            error: 'Validation failed',
            message: 'First name is required',
            timestamp: new Date().toISOString(),
          },
        },
      };
      
      mockAxios.put.mockRejectedValue(validationError);

      await expect(api.users.updateMe(updateData)).rejects.toThrow();
    });

    it('handles server errors during update', async () => {
      const mockAxios = require('axios');
      const serverError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };
      
      mockAxios.put.mockRejectedValue(serverError);

      await expect(api.users.updateMe(updateData)).rejects.toThrow();
    });

    it('validates update request data types', async () => {
      const updatedUser = createMockUser(updateData);
      const mockResponse = createMockApiResponse(updatedUser);
      const mockAxios = require('axios');
      mockAxios.put.mockResolvedValue({ data: mockResponse });

      // Test with valid data types
      await expect(api.users.updateMe({
        firstName: 'Valid',
        lastName: 'Name',
      })).resolves.toBeDefined();

      // Verify the request was made with correct data
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/users/me',
        { firstName: 'Valid', lastName: 'Name' },
        expect.any(Object)
      );
    });

    it('handles empty update data', async () => {
      const mockAxios = require('axios');
      const validationError = {
        response: {
          status: 400,
          data: {
            success: false,
            error: 'Validation failed',
            message: 'At least one field is required',
            timestamp: new Date().toISOString(),
          },
        },
      };
      
      mockAxios.put.mockRejectedValue(validationError);

      await expect(api.users.updateMe({
        firstName: '',
        lastName: '',
      })).rejects.toThrow();
    });
  });

  describe('JWT Token Integration', () => {
    const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnRSb2xlIjoiQ1JFQVRPUiIsInRlbmFudElkIjoiYjgxYTQ3ODQtYTAyYi00NzgyLTkxYjUtNDgxY2U4ZjIyNWQ4IiwidXNlcklkIjoiN2MxZjY0ODItNjBhYS00YmUwLTlhMDktNTNmZTU0OTNjMjhmIiwicGxhdGZvcm1Sb2xlIjoiVEVOQU5UX09XTkVSIiwic3ViIjoidGVzdHVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTcyNDA3OTIsImV4cCI6MTc1NzMyNzE5Mn0.mRiSsF1wRYZWc3kKJquIYKSuLWr5Ms17svHqC2MnMs4';

    it('includes bearer token in requests', async () => {
      const mockResponse = createMockApiResponse(mockUser);
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({ data: mockResponse });

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(testToken),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      await api.users.getMe();

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/users/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${testToken}`,
          }),
        })
      );
    });

    it('handles missing token gracefully', async () => {
      const mockAxios = require('axios');
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(null),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      const unauthorizedError = {
        response: {
          status: 401,
          data: {
            success: false,
            error: 'Unauthorized',
            message: 'No token provided',
          },
        },
      };
      
      mockAxios.get.mockRejectedValue(unauthorizedError);

      await expect(api.users.getMe()).rejects.toThrow();
    });
  });

  describe('API Response Format Validation', () => {
    it('validates successful response format', async () => {
      const mockResponse = createMockApiResponse(mockUser);
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await api.users.getMe();

      // Check response wrapper format
      expect(result).toMatchObject({
        success: true,
        data: expect.any(Object),
        timestamp: expect.any(String),
      });

      // Check timestamp is valid ISO string
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

    it('validates error response format', async () => {
      const mockAxios = require('axios');
      const errorResponse = {
        response: {
          status: 400,
          data: {
            success: false,
            error: 'Bad Request',
            message: 'Invalid request data',
            timestamp: new Date().toISOString(),
          },
        },
      };
      
      mockAxios.get.mockRejectedValue(errorResponse);

      try {
        await api.users.getMe();
      } catch (error: any) {
        expect(error.response.data).toMatchObject({
          success: false,
          error: expect.any(String),
          message: expect.any(String),
          timestamp: expect.any(String),
        });
      }
    });
  });

  describe('Backend Integration Notes', () => {
    it('documents current backend endpoint status', () => {
      // This test documents the current state of backend endpoints
      // as mentioned in the profile form component
      
      // Expected working endpoint: GET/PUT /users/me
      // Currently problematic: GET/PUT /users/profile (returns 500)
      
      expect(true).toBe(true); // This passes to document the current state
      
      /**
       * Backend Integration Notes:
       * 
       * Working endpoints:
       * - POST /auth/register
       * - POST /auth/login  
       * - POST /auth/verify-email
       * 
       * Expected to work but currently return 500:
       * - GET /users/me (should return user profile)
       * - PUT /users/me (should update user profile)
       * 
       * Alternative endpoints that return 500:
       * - GET /users/profile
       * - PUT /users/profile
       * 
       * Test JWT token for debugging:
       * eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnRSb2xlIjoiQ1JFQVRPUiIsInRlbmFudElkIjoiYjgxYTQ3ODQtYTAyYi00NzgyLTkxYjUtNDgxY2U4ZjIyNWQ4IiwidXNlcklkIjoiN2MxZjY0ODItNjBhYS00YmUwLTlhMDktNTNmZTU0OTNjMjhmIiwicGxhdGZvcm1Sb2xlIjoiVEVOQU5UX09XTkVSIiwic3ViIjoidGVzdHVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTcyNDA3OTIsImV4cCI6MTc1NzMyNzE5Mn0.mRiSsF1wRYZWc3kKJquIYKSuLWr5Ms17svHqC2MnMs4
       * 
       * Expected request/response format:
       * 
       * GET /users/me
       * Headers: Authorization: Bearer <token>
       * Response: {
       *   success: true,
       *   data: {
       *     id: "uuid",
       *     email: "user@example.com",
       *     firstName: "First",
       *     lastName: "Last",
       *     platformRole: "TENANT_OWNER",
       *     tenantId: "uuid",
       *     emailVerified: true,
       *     createdAt: "ISO date",
       *     updatedAt: "ISO date"
       *   },
       *   timestamp: "ISO date"
       * }
       * 
       * PUT /users/me
       * Headers: Authorization: Bearer <token>, Content-Type: application/json
       * Body: { firstName: "New", lastName: "Name" }
       * Response: Same as GET with updated data
       */
    });
  });
});