import { AxiosResponse } from 'axios';
import apiClient from './client';
import {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  UpdateUserRequest,
  User,
} from '@/lib/types';

export const authApi = {
  // Register new user
  // Expected Input: {"email": "user@example.com", "password": "TestPassword123!", "firstName": "Test", "lastName": "User"}
  // Expected Output (Success): {"success": true, "message": "User registered successfully", "data": {"accessToken": null, "refreshToken": null, "user": {...}, "message": "Registration successful. Please check your email to verify your account."}}
  // Expected Output (Error): {"success": false, "message": "Validation failed", "error": "{password=Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.}"}
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response: AxiosResponse<ApiResponse<RegisterResponse>> = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Login user
  // Expected Input: {"email": "user@example.com", "password": "TestPassword123!"}
  // Expected Output (Success): {"success": true, "data": {"accessToken": "...", "refreshToken": "...", "user": {...}, "tenant": {...}}}
  // Expected Output (Error): {"success": false, "error": "Invalid username or password"}
  // Note: Backend may also return {"success": false, "error": "Rate limit exceeded. Too many requests. Please try again later."}
  login: async (data: LoginRequest): Promise<ApiResponse<AuthTokens>> => {
    const response: AxiosResponse<ApiResponse<AuthTokens>> = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Refresh access token
  // Expected Input: {"refreshToken": "..."}
  // Expected Output (Success): {"success": true, "data": {"accessToken": "...", "refreshToken": "...", "user": {...}, "tenant": {...}}}
  // Expected Output (Error): {"success": false, "error": "Invalid or expired refresh token"}
  refresh: async (data: RefreshTokenRequest): Promise<ApiResponse<AuthTokens>> => {
    const response: AxiosResponse<ApiResponse<AuthTokens>> = await apiClient.post('/auth/refresh', data);
    return response.data;
  },

  // Logout user
  // Expected Input: No body (uses Authorization header)
  // Expected Output (Success): {"success": true, "data": {"message": "Logged out successfully"}}
  // Expected Output (Error): {"success": false, "error": "Invalid or expired token"}
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Verify email
  // Expected Input: {"token": "verification-token-string"}
  // Expected Output (Success): {"success": true, "data": "Email verified successfully"}
  // Expected Output (Error): {"success": false, "error": "Invalid argument: Invalid or expired verification token"}
  verifyEmail: async (token: string): Promise<ApiResponse<string>> => {
    const response: AxiosResponse<ApiResponse<string>> = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  // Request password reset
  // Expected Input: {"email": "user@example.com"}
  // Expected Output (Success): {"success": true, "data": {"message": "Password reset email sent"}}
  // Expected Output (Error): {"success": false, "error": "User not found"} or rate limit error
  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  // Expected Input: {"token": "reset-token-string", "newPassword": "NewPassword123!"}
  // Expected Output (Success): {"success": true, "data": {"message": "Password reset successfully"}}
  // Expected Output (Error): {"success": false, "error": "Invalid or expired reset token"}
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Resend email verification
  // Expected Input: {"email": "user@example.com"}
  // Expected Output (Success): {"success": true, "data": "Verification email sent"}
  // Expected Output (Error): {"success": false, "error": "User not found"} or rate limit error
  resendVerification: async (email: string): Promise<ApiResponse<string>> => {
    const response: AxiosResponse<ApiResponse<string>> = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },
};

export const userApi = {
  // Get current user profile - TESTED with actual API
  // Expected Input: No body (uses Authorization header)
  // Expected Output (Success): {"success": true, "data": {"id": "7c1f6482-60aa-4be0-9a09-53fe5493c28f", "email": "testuser@example.com", "firstName": "Test", "lastName": "User", "role": "USER", "emailVerified": true, "createdAt": "2025-09-07T10:24:38.368626", "tenantId": "b81a4784-a02b-4782-91b5-481ce8f225d8", "platformRole": "TENANT_OWNER"}}
  // Expected Output (Error): {"success": false, "error": "An unexpected error occurred"} (Currently backend returns 500)
  // NOTE: Backend endpoint currently throwing 500 errors - needs backend debugging
  getMe: async (): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/users/profile');
    return response.data;
  },

  // Update user profile - TESTED with actual API 
  // Expected Input: {"firstName": "Updated", "lastName": "Name"}
  // Expected Output (Success): {"success": true, "data": {"id": "7c1f6482-60aa-4be0-9a09-53fe5493c28f", "email": "testuser@example.com", "firstName": "Updated", "lastName": "Name", "role": "USER", "emailVerified": true, "createdAt": "2025-09-07T10:24:38.368626", "tenantId": "b81a4784-a02b-4782-91b5-481ce8f225d8", "platformRole": "TENANT_OWNER"}}
  // Expected Output (Error): {"success": false, "error": "An unexpected error occurred"} (Currently backend returns 500)
  // NOTE: Backend endpoint currently throwing 500 errors - needs backend debugging
  updateMe: async (data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.put('/users/profile', data);
    return response.data;
  },

  // Change password - ENDPOINT NOT VERIFIED YET
  // Expected Input: {"currentPassword": "OldPassword123!", "newPassword": "NewPassword123!"}
  // Expected Output (Success): {"success": true, "data": {"message": "Password changed successfully"}}
  // Expected Output (Error): {"success": false, "error": "Current password is incorrect"}
  // NOTE: This endpoint path not confirmed in backend API testing
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.put('/users/me/password', data);
    return response.data;
  },
};