'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, CheckCircle2, AlertCircle, Users, Calendar } from 'lucide-react';
import { projectsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ProjectStats() {
  const [stats, setStats] = useState({
    created: 0,
    active: 0,
    onProgress: 0,
    stopped: 0,
    completed: 0,
    cancelled: 0,
    delayed: 0,
    total: 0,
    totalMembers: 0,
    upcomingDeadlines: [],
    recentUpdates: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjectStats();
  }, []);

  const fetchProjectStats = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getProjectStats();
      if (response?.data?.success && response?.data?.stats) {
        setStats(response.data.stats);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching project stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const mainStats = [
    {
      title: 'Created',
      value: stats.created,
      icon: Clock,
      description: 'Newly created projects',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: Activity,
      description: 'Projects ready to start',
    },
    {
      title: 'In Progress',
      value: stats.onProgress,
      icon: Clock,
      description: 'Projects being worked on',
    },
    {
      title: 'Stopped',
      value: stats.stopped,
      icon: AlertCircle,
      description: 'Projects on hold',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      description: 'Successfully completed',
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      icon: AlertCircle,
      description: 'Projects cancelled',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={loading ? 'animate-pulse' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '-' : stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {stats.upcomingDeadlines?.length > 0 ? (
                <div className="space-y-4">
                  {stats.upcomingDeadlines.map((project) => (
                    <div key={project._id} className="flex justify-between items-center">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No upcoming deadlines
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {stats.recentUpdates?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentUpdates.map((update) => (
                    <div key={update._id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{update.name}</span>
                        <span className="text-sm text-muted-foreground">
                          updated by {update.updatedBy?.name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(update.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent updates
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 