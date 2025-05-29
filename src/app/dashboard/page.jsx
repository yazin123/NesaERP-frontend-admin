'use client';

import { withAuth } from '@/components/auth/withAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
    Users,
    Briefcase,
    CheckSquare,
    AlertTriangle,
    Calendar,
    BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';

function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = user?.role === 'admin' || user?.role === 'superadmin'
                ? await api.admin.getDashboardStats()
                : await api.getMyDashboardStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value }) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <h3 className="text-2xl font-bold">{value}</h3>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">
                    <Skeleton className="h-9 w-48" />
                </h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle>
                                    <Skeleton className="h-6 w-24" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center space-y-4">
                            <h2 className="text-xl font-semibold text-destructive">Error</h2>
                            <p>{error}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Briefcase}
                    label="Total Projects"
                    value={user?.role === 'admin' || user?.role === 'superadmin' 
                        ? stats?.projects?.total || 0 
                        : stats?.totalProjects || 0}
                />
                <StatCard
                    icon={CheckSquare}
                    label="Active Tasks"
                    value={user?.role === 'admin' || user?.role === 'superadmin'
                        ? (stats?.tasks?.byStatus?.find(s => s._id === 'active')?.count || 0)
                        : stats?.activeTasks || 0}
                />
                <StatCard
                    icon={Users}
                    label="Team Members"
                    value={user?.role === 'admin' || user?.role === 'superadmin'
                        ? stats?.users?.total || 0
                        : stats?.teamMembers || 0}
                />
                <StatCard
                    icon={CheckSquare}
                    label="Completed Tasks"
                    value={user?.role === 'admin' || user?.role === 'superadmin'
                        ? (stats?.tasks?.byStatus?.find(s => s._id === 'Completed')?.count || 0)
                        : stats?.completedTasks || 0}
                />
            </div>

            {/* Recent Projects */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                        <CardDescription>Latest project updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(user?.role === 'admin' || user?.role === 'superadmin' 
                                ? stats?.projects?.recent 
                                : stats?.recentProjects)?.map((project, index) => (
                                <div key={project._id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{project.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {project.description?.substring(0, 100)}
                                            {project.description?.length > 100 ? '...' : ''}
                                        </p>
                                    </div>
                                    <Badge>{project.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                        <CardDescription>Tasks due in the next 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(user?.role === 'admin' || user?.role === 'superadmin' 
                                ? stats?.tasks?.upcoming 
                                : stats?.upcomingDeadlines)?.map((task, index) => (
                                <div key={task._id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{task.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <Badge>{task.priority}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default withAuth(DashboardPage); 