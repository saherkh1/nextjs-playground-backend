'use client';

import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileInfoProps {
  user: User;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'PLATFORM_ADMIN':
        return 'Platform Admin';
      case 'TENANT_OWNER':
        return 'Studio Owner';
      case 'USER':
        return 'User';
      default:
        return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Full Name</div>
            <div className="text-base font-semibold">
              {user.firstName} {user.lastName}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Email Address</div>
            <div className="text-base">{user.email}</div>
          </div>

          {/* Email Verification Status */}
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Email Status</div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.emailVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>

          {/* Platform Role */}
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Role</div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getRoleDisplay(user.platformRole)}
            </span>
          </div>

          {/* Tenant ID */}
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Studio ID</div>
            <div className="text-sm font-mono text-gray-600">{user.tenantId}</div>
          </div>

          {/* Account Created */}
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Member Since</div>
            <div className="text-base">{formatDate(user.createdAt)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}