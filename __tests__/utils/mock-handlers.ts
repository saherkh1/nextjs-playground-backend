import { http, HttpResponse } from 'msw';
import { createMockApiResponse, createMockUser } from './test-utils';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, () => {
    const mockResponse = createMockApiResponse({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: createMockUser(),
    });
    return HttpResponse.json(mockResponse);
  }),

  http.post(`${API_BASE_URL}/auth/register`, () => {
    const mockResponse = createMockApiResponse({
      accessToken: null,
      refreshToken: null,
      user: createMockUser({ emailVerified: false }),
      message: 'Registration successful. Please verify your email.',
    });
    return HttpResponse.json(mockResponse);
  }),

  // User profile endpoints - Success scenarios
  http.get(`${API_BASE_URL}/users/me`, () => {
    const mockResponse = createMockApiResponse(createMockUser());
    return HttpResponse.json(mockResponse);
  }),

  http.put(`${API_BASE_URL}/users/me`, async ({ request }) => {
    const body = await request.json() as any;
    const updatedUser = createMockUser({
      firstName: body.firstName,
      lastName: body.lastName,
      updatedAt: new Date().toISOString(),
    });
    const mockResponse = createMockApiResponse(updatedUser);
    return HttpResponse.json(mockResponse);
  }),

  // Error scenarios for profile endpoints (simulating current backend 500 errors)
  http.get(`${API_BASE_URL}/users/profile`, () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }),

  http.put(`${API_BASE_URL}/users/profile`, () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }),

  // Tenant endpoints
  http.get(`${API_BASE_URL}/tenants/me`, () => {
    const mockTenant = {
      id: 'b81a4784-a02b-4782-91b5-481ce8f225d8',
      name: 'Test Studio',
      subdomain: 'teststudio',
      createdAt: '2025-09-07T10:24:38.368626',
      updatedAt: '2025-09-07T10:24:38.368626',
    };
    const mockResponse = createMockApiResponse(mockTenant);
    return HttpResponse.json(mockResponse);
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = [
  // Profile fetch error
  http.get(`${API_BASE_URL}/users/me`, () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }),

  // Profile update error
  http.put(`${API_BASE_URL}/users/me`, () => {
    return HttpResponse.json({
      success: false,
      error: 'Validation failed',
      message: 'First name is required',
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  }),

  // Unauthorized error
  http.get(`${API_BASE_URL}/users/me`, () => {
    return HttpResponse.json({
      success: false,
      error: 'Unauthorized',
      message: 'Token expired',
      timestamp: new Date().toISOString(),
    }, { status: 401 });
  }),
];

export const networkErrorHandlers = [
  // Network error simulation
  http.get(`${API_BASE_URL}/users/me`, () => {
    return HttpResponse.error();
  }),

  http.put(`${API_BASE_URL}/users/me`, () => {
    return HttpResponse.error();
  }),
];