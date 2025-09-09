// Authentication Types
import type { Tenant } from './tenant';

export type PlatformRole = 'PLATFORM_ADMIN' | 'TENANT_OWNER' | 'USER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  platformRole: PlatformRole;
  tenantId: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  user: User;
  tenant?: Tenant;
  message?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
}

// Registration response includes both tokens (initially null) and user data
export interface RegisterResponse {
  accessToken: string | null;
  refreshToken: string | null;
  user: User;
  message: string;
}

// JWT Claims
export interface JWTClaims {
  sub: string; // user id
  email: string;
  tenantId: string;
  platformRole: PlatformRole;
  tenantRole?: string;
  exp: number;
  iat: number;
}