'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem('authToken');
      if (!token || !isAuthenticated) {
        // Clear any stale data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.replace('/');
      } else if (user?.role && !['superadmin', 'admin'].includes(user.role)) {
        // If user is not admin/superadmin, redirect to employee dashboard
        router.replace('/employee/dashboard');
      }
    }
  }, [loading, isAuthenticated, router, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return children;
}