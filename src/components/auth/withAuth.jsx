'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function withAuth(Component) {
    return function ProtectedRoute(props) {
        const { user, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && !user) {
                router.push('/');
            }
        }, [user, loading, router]);

        if (loading) {
            return null; // or a loading spinner
        }

        if (!user) {
            return null;
        }

        return <Component {...props} />;
    };
} 