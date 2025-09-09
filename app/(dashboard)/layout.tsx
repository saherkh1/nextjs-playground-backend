'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { P } from '@/components/ui/typography';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect('/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingState 
          message="Loading your PhotoFlow workspace..."
          className="text-text-secondary"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}