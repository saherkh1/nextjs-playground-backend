'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Tenant, PlatformRole } from '@/lib/types';
import { api, setTokens, clearTokens, getAccessToken, getRefreshToken } from '@/lib/api';

interface AuthContextType {
  // State
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;

  // Utilities
  hasRole: (role: PlatformRole) => boolean;
  canAccess: (requiredRole: PlatformRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Role hierarchy for access control
  const roleHierarchy: Record<PlatformRole, number> = {
    USER: 1,
    TENANT_OWNER: 2,
    PLATFORM_ADMIN: 3,
  };

  const hasRole = (role: PlatformRole): boolean => {
    if (!user) return false;
    return user.platformRole === role;
  };

  const canAccess = (requiredRole: PlatformRole): boolean => {
    if (!user) return false;
    return roleHierarchy[user.platformRole] >= roleHierarchy[requiredRole];
  };

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.auth.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success) {
        const { user, tenant, accessToken, refreshToken } = response.data;
        console.log('Login successful, tokens:', { accessToken: accessToken ? 'present' : 'missing', refreshToken: refreshToken ? 'present' : 'missing' });
        
        // Store tokens
        setTokens(response.data);
        
        // Update state
        setUser(user);
        setTenant(tenant || null); // Handle case where tenant might not be returned
        
        // Store user and tenant data for persistence
        localStorage.setItem('user', JSON.stringify(user));
        if (tenant) {
          localStorage.setItem('tenant', JSON.stringify(tenant));
        }
        
        console.log('Login completed, user state updated');
      } else {
        // Use the specific error message from the API response
        const errorMessage = (response as any).error || 'Login failed';
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      // Try to extract error message from API response
      let errorMessage = 'Login failed';
      
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.auth.register({
        firstName,
        lastName,
        email,
        password,
      });
      
      if (!response.success) {
        // Use the specific error message from the API response
        const errorMessage = (response as any).error || (response as any).message || 'Registration failed';
        throw new Error(errorMessage);
      }
      
      // Registration successful, but user needs to verify email
      // Don't set user state yet
    } catch (err: any) {
      // Try to extract error message from API response
      let errorMessage = 'Registration failed';
      
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    try {
      // Call logout API (fire and forget)
      api.auth.logout().catch(console.warn);
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      setTenant(null);
      setError(null);
      clearTokens();
    }
  };

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Refreshing user data...');
      
      // Try to fetch user profile first
      const userResponse = await api.users.getMe();
      console.log('User response:', userResponse);
      
      if (userResponse.success) {
        setUser(userResponse.data);
        localStorage.setItem('user', JSON.stringify(userResponse.data));
        
        // Try to fetch tenant data, but don't fail if it doesn't work
        try {
          const tenantResponse = await api.tenants.getMe();
          console.log('Tenant response:', tenantResponse);
          
          if (tenantResponse.success) {
            setTenant(tenantResponse.data);
            localStorage.setItem('tenant', JSON.stringify(tenantResponse.data));
          } else {
            console.warn('Tenant API returned error (non-critical):', tenantResponse);
          }
        } catch (tenantErr) {
          console.warn('Failed to fetch tenant data (non-critical):', tenantErr);
          // Don't logout for tenant failures - user data is more important
        }
      } else {
        console.warn('User profile API returned error, keeping existing state');
        // Don't logout just because profile fetch failed - user might already be logged in
      }
    } catch (err) {
      console.warn('Failed to refresh user data:', err);
      // Only logout if it's a token issue, not just a temporary API issue
      if ((err as any)?.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();
        
        if (accessToken || refreshToken) {
          // Try to get current user data
          const storedUser = localStorage.getItem('user');
          const storedTenant = localStorage.getItem('tenant');
          
          if (storedUser && storedTenant) {
            // Use stored data initially
            setUser(JSON.parse(storedUser));
            setTenant(JSON.parse(storedTenant));
            
            // Refresh in background
            refreshUser().catch(() => {
              // If refresh fails, clear everything
              logout();
            });
          } else {
            // No stored data, try to fetch
            await refreshUser();
          }
        }
      } catch (err) {
        console.warn('Auth initialization failed:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUser]);

  const value: AuthContextType = {
    // State
    user,
    tenant,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    clearError,
    refreshUser,

    // Utilities
    hasRole,
    canAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};