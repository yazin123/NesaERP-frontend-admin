'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Network,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { monitoringApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function SystemMonitoring() {
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [timeframe, setTimeframe] = useState('1h');
  const [logLevel, setLogLevel] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const timeframes = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' }
  ];

  const logLevels = ['all', 'info', 'warning', 'error', 'debug'];

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchSystemMetrics = async () => {
    try {
      setLoading(true);
      const response = await monitoringApi.getSystemMetrics({ timeframe });
      if (response.data) {
        setSystemMetrics(response.data);
      }
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch system metrics. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      operational: 'bg-green-500',
      degraded: 'bg-yellow-500',
      down: 'bg-red-500'
    };
    return colors[status.toLowerCase()] || 'bg-gray-500';
  };

  const getLogLevelColor = (level) => {
    const colors = {
      info: 'bg-blue-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      debug: 'bg-gray-500'
    };
    return colors[level.toLowerCase()] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!systemMetrics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">System Metrics Unavailable</h2>
          <p className="text-muted-foreground">
            Unable to fetch system metrics. Please try again later.
          </p>
          <Button onClick={fetchSystemMetrics} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">System Monitoring</h1>
          <Badge className={getStatusColor(systemMetrics.status.overall)}>
            {systemMetrics.status.overall}
          </Badge>
        </div>

        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((tf) => (
              <SelectItem key={tf.value} value={tf.value}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span>{systemMetrics.status.uptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{systemMetrics.status.activeUsers}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{systemMetrics.resources.cpu.usage}%</span>
                <span className="text-sm text-muted-foreground">
                  {systemMetrics.resources.cpu.cores} Cores
                </span>
              </div>
              <Progress value={systemMetrics.resources.cpu.usage} />
              <div className="text-sm text-muted-foreground">
                Temperature: {systemMetrics.resources.cpu.temperature}°C
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{systemMetrics.resources.memory.usage}%</span>
                <span className="text-sm text-muted-foreground">
                  {systemMetrics.resources.memory.used}GB / {systemMetrics.resources.memory.total}GB
                </span>
              </div>
              <Progress value={systemMetrics.resources.memory.usage} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{systemMetrics.resources.disk.usage}%</span>
                <span className="text-sm text-muted-foreground">
                  {systemMetrics.resources.disk.used}GB / {systemMetrics.resources.disk.total}GB
                </span>
              </div>
              <Progress value={systemMetrics.resources.disk.usage} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics.services.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                    <span>{service.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="mr-4">Uptime: {service.uptime}</span>
                    <span>Response: {service.responseTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Recent Logs</CardTitle>
            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Log level" />
              </SelectTrigger>
              <SelectContent>
                {logLevels.map((level) => (
                  <SelectItem key={level} value={level} className="capitalize">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics.recentLogs
                .filter(log => logLevel === 'all' || log.level === logLevel)
                .map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <Badge className={getLogLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{log.service}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.message}
                      </p>
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