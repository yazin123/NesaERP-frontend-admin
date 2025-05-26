'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function withAuth(Component) {
    return function ProtectedRoute(props) {
        const { user } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!user) {
                router.push('/');
            }
        }, [user, router]);

        // Don't render the component if there's no user
        if (!user) {
            return null;
        }

        // Render the component if user is authenticated
        return <Component {...props} />;
    };
}

export default withAuth; 