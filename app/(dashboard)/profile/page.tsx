'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { User } from '@/lib/types';
import { api } from '@/lib/api';
import { ProfileInfo } from '@/components/profile/profile-info';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch fresh user profile data
  const fetchUserProfile = async () => {
    if (!authUser) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching user profile...');

      const response = await api.users.getMe();
      console.log('Profile API response:', response);
      
      if (response.success) {
        setUser(response.data);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      
      let errorMessage = 'Failed to load profile data';
      
      if (err?.response?.status === 500) {
        errorMessage = 'Profile service temporarily unavailable. Using cached user data from login.';
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      // Fallback to auth context user data
      setUser(authUser);
      
      // Clear error after showing it briefly since we have fallback data
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    if (authUser) {
      // Add a small delay to ensure token is properly set
      const timer = setTimeout(() => {
        fetchUserProfile();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authUser]);

  // Handle successful profile updates
  const handleUpdateSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    setError(null);
  };

  // Retry loading profile data
  const handleRetry = () => {
    fetchUserProfile();
  };

  if (!authUser) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !user && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Content */}
      {user && (
        <div className="space-y-6">
          {/* Profile Information (Read-only) */}
          <ProfileInfo user={user} />

          {/* Edit Profile Form */}
          <EditProfileForm user={user} onUpdateSuccess={handleUpdateSuccess} />
        </div>
      )}
    </div>
  );
}