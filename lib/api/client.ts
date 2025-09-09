import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ApiResponse, ApiError, AuthTokens, RefreshTokenRequest } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

console.log('API_BASE_URL configured as:', API_BASE_URL);

// Token management utilities
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;
  // Only set tokens if they are not null (successful login)
  if (tokens.accessToken) {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  }
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
  localStorage.removeItem('tenant');
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth header
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    const fullUrl = config.baseURL + config.url;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Making ${config.method?.toUpperCase()} request to ${fullUrl} with token`);
    } else {
      console.log(`Making ${config.method?.toUpperCase()} request to ${fullUrl} WITHOUT token`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post<ApiResponse<AuthTokens>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken } as RefreshTokenRequest,
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
          
          if (response.data.success) {
            setTokens(response.data.data);
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle specific error scenarios
    if (error.response?.status === 403) {
      // Forbidden - could be email not verified or insufficient permissions
      console.warn('Access forbidden:', error.response.data.message);
    }
    
    if (error.response?.status === 429) {
      // Rate limited
      console.warn('Rate limited:', error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

// Add TypeScript declaration for retry flag
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

export default apiClient;