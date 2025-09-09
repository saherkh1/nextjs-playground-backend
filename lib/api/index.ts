// Export all API services
export * from './client';
export * from './auth';
export * from './tenant';

// Import and re-export for convenience
import { authApi, userApi } from './auth';
import { tenantApi } from './tenant';

export const api = {
  auth: authApi,
  users: userApi,
  tenants: tenantApi,
};

export default api;