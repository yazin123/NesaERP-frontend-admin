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
    BarChart,
    Star,
    TrendingUp,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { monitoringApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { Progress } from '@/components/ui/progress';

function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const isAdmin = user?.roleLevel >= 70;

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await monitoringApi.getDashboardStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, trend }) => (
        <Card>
            <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                    {trend && (
                        <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {trend}
                        </p>
                    )}
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

    if (isAdmin) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">System Dashboard</h1>
                    <Badge variant="outline" className="text-lg">Admin View</Badge>
                </div>
                
                {/* Stats Overview */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Projects"
                        value={stats.projects?.total}
                        icon={Briefcase}
                        trend={`${stats.projects?.byStatus.find(s => s._id === 'active')?.count || 0} Active`}
                    />
                    <StatCard
                        title="Total Users"
                        value={stats.users?.total}
                        icon={Users}
                        trend={`${stats.users?.active} Active Users`}
                    />
                    <StatCard
                        title="Total Tasks"
                        value={stats.tasks?.total}
                        icon={CheckSquare}
                        trend={`${stats.tasks?.upcomingCount} Due Soon`}
                    />
                    <StatCard
                        title="Overall Performance"
                        value={`${Math.round(stats.performance?.overall?.avgPoints || 0)}`}
                        icon={BarChart}
                        trend="Average Points"
                    />
                </div>

                {/* Project Status and Performance */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Status Overview</CardTitle>
                            <CardDescription>Distribution by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.projects?.byStatus.map((status) => (
                                    <div key={status._id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={status._id.toLowerCase()}>{status._id}</Badge>
                                            <span>{status.count} Projects</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {Math.round((status.count / stats.projects?.total) * 100)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Categories</CardTitle>
                            <CardDescription>Average points by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.performance?.byCategory?.map((category) => (
                                    <div key={category._id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Star className="h-4 w-4 text-primary" />
                                            <span>{category._id}</span>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {Math.round(category.avgPoints)} pts
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Projects and Tasks */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Projects</CardTitle>
                            <CardDescription>Latest project updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.projects?.recent?.map((project) => (
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Deadlines</CardTitle>
                            <CardDescription>Tasks due soon</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.tasks?.upcoming?.map((task) => (
                                    <div key={task._id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{task.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <Badge variant={task.priority.toLowerCase()}>{task.priority}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // User Dashboard
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Dashboard</h1>
                <Badge variant="outline" className="text-lg">Personal View</Badge>
            </div>
            
            {/* Personal Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="My Projects"
                    value={stats.totalProjects}
                    icon={Briefcase}
                />
                <StatCard
                    title="Active Tasks"
                    value={stats.activeTasks}
                    icon={CheckSquare}
                />
                <StatCard
                    title="Team Members"
                    value={stats.teamMembers}
                    icon={Users}
                />
                <StatCard
                    title="Performance"
                    value={stats.performance?.points || 0}
                    icon={BarChart}
                    trend={stats.performance?.category}
                />
            </div>

            {/* Projects and Tasks */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Projects</CardTitle>
                        <CardDescription>Projects you're involved in</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentProjects?.map((project) => (
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

                <Card>
                    <CardHeader>
                        <CardTitle>My Upcoming Tasks</CardTitle>
                        <CardDescription>Tasks due in the next 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.upcomingDeadlines?.map((task) => (
                                <div key={task._id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{task.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                                            {task.project && ` • ${task.project.name}`}
                                        </p>
                                    </div>
                                    <Badge variant={task.priority.toLowerCase()}>{task.priority}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.projects?.byStatus.map((status) => (
                                <div key={status._id} className="flex justify-between text-sm mb-2">
                                    <span>{status._id}</span>
                                    <span>{Math.round((status.count / stats.projects?.total) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                        <Progress value={stats.projectProgress || 0} className="h-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentActivity?.map((activity) => (
                                <div key={activity.id} className="flex items-center">
                                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                                    <div>
                                        <p className="text-sm font-medium">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
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