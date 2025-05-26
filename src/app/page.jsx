'use client';

import { useState } from 'react';
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
import api from '@/api';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            
            const response = await api.login(data);
            const { token, user } = response;
            
            await login(token, user);
            
            toast({
                title: 'Success',
                description: 'Welcome back!',
            });
        } catch (error) {
            console.error('Login error:', error);
            setError(error?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="userId">
                                User ID
                            </label>
                            <Input
                                id="userId"
                                type="text"
                                placeholder="Enter your user ID"
                                {...register('userId', {
                                    required: 'User ID is required'
                                })}
                                error={errors.userId?.message}
                            />
                            {errors.userId && (
                                <p className="text-sm text-destructive">{errors.userId.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="password">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    }
                                })}
                                error={errors.password?.message}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 