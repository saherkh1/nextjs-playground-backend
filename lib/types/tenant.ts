// Tenant Types

export type TenantPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED' | 'INACTIVE';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: TenantPlan;
  status: TenantStatus;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  galleryLimit: number;
  galleryCount: number;
  canCreateMoreGalleries: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantRequest {
  name: string;
  subdomain?: string;
}