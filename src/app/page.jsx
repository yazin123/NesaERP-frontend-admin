'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            userId: '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');
            
            await login(data);
            
            toast({
                title: 'Success',
                description: 'Welcome back!',
            });
        } catch (error) {
            console.error('Login error:', error);
            setError(error?.response?.data?.message || 'Invalid credentials');
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Invalid credentials',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                        Please sign in to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                {...register('userId', { required: 'User ID is required' })}
                                placeholder="User ID"
                                disabled={loading}
                            />
                            {errors.userId && (
                                <p className="text-sm text-destructive">{errors.userId.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Input
                                {...register('password', { required: 'Password is required' })}
                                type="password"
                                placeholder="Password"
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 