'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    Activity,
    Mail,
    AlertTriangle,
    Server,
    Database,
    Users,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import { monitoringApi } from '@/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function MonitoringDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [emailQueue, setEmailQueue] = useState(null);
    const [systemHealth, setSystemHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const [refreshKey, setRefreshKey] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async () => {
        try {
            setRefreshing(true);
            const [metricsData, queueData, healthData] = await Promise.all([
                monitoringApi.getSystemMetrics(),
                monitoringApi.getEmailQueue(),
                monitoringApi.getSystemHealth()
            ]);

            setMetrics(metricsData.data);
            setEmailQueue(queueData.data);
            setSystemHealth(healthData.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch monitoring data');
            toast({
                title: 'Error',
                description: 'Failed to fetch monitoring data',
                variant: 'destructive',
            });
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    const clearFailedJobs = async () => {
        try {
            await monitoringApi.clearFailedEmails();
            toast({
                title: 'Success',
                description: 'Failed jobs cleared successfully',
            });
            fetchMetrics();
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to clear failed jobs',
                variant: 'destructive',
            });
        }
    };

    const formatBytes = (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    const MetricCard = ({ title, value, icon: Icon, description, trend }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className={`text-xs mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.text}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const getStatusColor = (status) => {
        const colors = {
            healthy: 'bg-green-500',
            warning: 'bg-yellow-500',
            critical: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const handleRestartService = async (service) => {
        try {
            await monitoringApi.restartService(service);
            toast({
                title: 'Success',
                description: `${service} service restarted successfully`,
            });
            fetchMetrics();
        } catch (error) {
            console.error('Error restarting service:', error);
            toast({
                title: 'Error',
                description: error.message || `Failed to restart ${service} service`,
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-96">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Loading metrics...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!metrics) {
        return (
            <div className="flex items-center justify-center h-96">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                <p className="ml-2">No metrics data available</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">System Monitoring</h1>
                <Button
                    onClick={fetchMetrics}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="email">Email Queue</TabsTrigger>
                    <TabsTrigger value="system">System Health</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="Active Users"
                            value={metrics?.custom.find(m => m.name === 'active_users')?.values[0]?.value || 0}
                            icon={Users}
                            description="Currently online users"
                        />
                        <MetricCard
                            title="Total Projects"
                            value={metrics?.custom.find(m => m.name === 'total_projects')?.values[0]?.value || 0}
                            icon={Activity}
                            description="Active projects"
                        />
                        <MetricCard
                            title="Error Rate"
                            value={metrics?.custom.find(m => m.name === 'error_rate')?.values[0]?.value || 0}
                            icon={AlertTriangle}
                            description="Errors in last hour"
                        />
                        <MetricCard
                            title="System Uptime"
                            value={`${Math.floor(metrics?.system.uptime / 3600)} hrs`}
                            icon={Server}
                            description="Since last restart"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Memory Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm">Heap Used</span>
                                        <span className="text-sm text-muted-foreground">
                                            {formatBytes(metrics?.system.memory.heapUsed)}
                                        </span>
                                    </div>
                                    <Progress 
                                        value={(metrics?.system.memory.heapUsed / metrics?.system.memory.heapTotal) * 100} 
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm">RSS</span>
                                        <span className="text-sm text-muted-foreground">
                                            {formatBytes(metrics?.system.memory.rss)}
                                        </span>
                                    </div>
                                    <Progress value={70} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <MetricCard
                            title="Waiting"
                            value={emailQueue?.waiting || 0}
                            icon={Clock}
                            description="Emails in queue"
                        />
                        <MetricCard
                            title="Active"
                            value={emailQueue?.active || 0}
                            icon={Mail}
                            description="Currently sending"
                        />
                        <MetricCard
                            title="Completed"
                            value={emailQueue?.completed || 0}
                            icon={CheckCircle2}
                            description="Successfully sent"
                        />
                        <MetricCard
                            title="Failed"
                            value={emailQueue?.failed || 0}
                            icon={XCircle}
                            description="Failed to send"
                        />
                        <MetricCard
                            title="Delayed"
                            value={emailQueue?.delayed || 0}
                            icon={Clock}
                            description="Scheduled emails"
                        />
                    </div>

                    {emailQueue?.failed > 0 && (
                        <Alert variant="destructive">
                            <AlertTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Failed Jobs Detected
                            </AlertTitle>
                            <AlertDescription className="flex items-center justify-between mt-2">
                                <span>There are {emailQueue.failed} failed email jobs in the queue.</span>
                                <Button onClick={clearFailedJobs} variant="outline" size="sm">
                                    Clear Failed Jobs
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                </TabsContent>

                <TabsContent value="system" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Database Operations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {metrics?.custom
                                        .filter(m => m.name === 'database_operations_total')
                                        .map((metric, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Database className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {metric.labels.operation} - {metric.labels.model}
                                                    </span>
                                                </div>
                                                <Badge>{metric.value}</Badge>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Node.js Version</span>
                                        <Badge variant="outline">{metrics?.system.nodeVersion}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Process Uptime</span>
                                        <Badge variant="outline">
                                            {Math.floor(metrics?.system.uptime / 3600)} hours
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">CPU Usage</span>
                                        <Badge variant="outline">
                                            {Math.round((metrics?.system.cpu.user / 1000000))}ms
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle>Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Uptime</TableHead>
                                <TableHead>Last Restart</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics.services.map((service) => (
                                <TableRow key={service.name}>
                                    <TableCell>{service.name}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(service.status)}>
                                            {service.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{service.uptime}</TableCell>
                                    <TableCell>{new Date(service.lastRestart).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRestartService(service.name)}
                                        >
                                            Restart
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 