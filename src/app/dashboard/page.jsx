'use client';

import { withAuth } from '@/components/auth/withAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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

function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await api.getDashboardStats();
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
                    value={stats?.totalProjects || 0}
                />
                <StatCard
                    icon={CheckSquare}
                    label="Active Tasks"
                    value={stats?.activeTasks || 0}
                />
                <StatCard
                    icon={Users}
                    label="Team Members"
                    value={stats?.teamMembers || 0}
                />
                <StatCard
                    icon={CheckSquare}
                    label="Completed Tasks"
                    value={stats?.completedTasks || 0}
                />
            </div>

            {/* Recent Projects and Upcoming Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                        <CardDescription>Latest project updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {stats?.recentProjects?.map(project => (
                                <div key={project._id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="font-medium leading-none">{project.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                                    {project.status}
                                                </Badge>
                                                <div className="flex -space-x-2">
                                                    {project.members?.map((member, i) => (
                                                        <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                                            <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                        <CardDescription>Tasks due in the next 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {stats?.upcomingDeadlines?.map(task => (
                                <div key={task._id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="font-medium leading-none">{task.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <Badge>{task.status}</Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    Due {format(new Date(task.deadline), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                        <Avatar>
                                            <AvatarFallback>
                                                {task.assignedTo?.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
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