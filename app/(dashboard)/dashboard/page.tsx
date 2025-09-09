'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  useEffect(() => {
    // Redirect to profile page since that's our main dashboard for now
    redirect('/profile');
  }, []);

  return null;
}