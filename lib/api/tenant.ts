import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, Tenant, UpdateTenantRequest } from '@/lib/types';

export const tenantApi = {
  // Get tenant by ID - CORRECTED to use proper endpoint pattern
  // First get user profile to get tenantId, then fetch tenant by ID
  // Expected Input: tenantId from user profile
  // Expected Output (Success): {"success": true, "data": {"id": "...", "name": "...", "subdomain": "...", ...}}
  // Expected Output (Error): {"success": false, "error": "Tenant not found"}
  getById: async (tenantId: string): Promise<ApiResponse<Tenant>> => {
    const response: AxiosResponse<ApiResponse<Tenant>> = await apiClient.get(`/tenants/${tenantId}`);
    return response.data;
  },

  // Get current user's tenant (convenience method)
  // This will first get user profile, then fetch tenant by ID
  getMe: async (): Promise<ApiResponse<Tenant>> => {
    // First get the current user to get their tenantId
    const { userApi } = await import('./auth');
    const userResponse = await userApi.getMe();
    
    if (!userResponse.success) {
      throw new Error('Failed to get user profile');
    }
    
    const tenantId = userResponse.data.tenantId;
    return await tenantApi.getById(tenantId);
  },

  // Update tenant information  
  // Expected Input: tenantId and update data {"name": "Studio Name", "subdomain": "studio-slug"}
  // Expected Output (Success): {"success": true, "data": {"id": "...", "name": "Studio Name", ...}}
  // Expected Output (Error): {"success": false, "error": "Invalid data"}
  updateById: async (tenantId: string, data: UpdateTenantRequest): Promise<ApiResponse<Tenant>> => {
    const response: AxiosResponse<ApiResponse<Tenant>> = await apiClient.put(`/tenants/${tenantId}`, data);
    return response.data;
  },

  // Update current user's tenant (convenience method)
  updateMe: async (data: UpdateTenantRequest): Promise<ApiResponse<Tenant>> => {
    const { userApi } = await import('./auth');
    const userResponse = await userApi.getMe();
    
    if (!userResponse.success) {
      throw new Error('Failed to get user profile');
    }
    
    const tenantId = userResponse.data.tenantId;
    return await tenantApi.updateById(tenantId, data);
  },
};