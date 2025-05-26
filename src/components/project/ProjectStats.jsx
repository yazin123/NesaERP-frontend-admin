'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export function ProjectStats() {
  // This will be replaced with actual API data
  const stats = [
    {
      title: 'Active Projects',
      value: '12',
      icon: Activity,
      description: '3 starting this month',
      trend: '+2 from last month',
      trendUp: true,
    },
    {
      title: 'In Progress',
      value: '8',
      icon: Clock,
      description: '5 in development phase',
      trend: 'On track',
      trendUp: true,
    },
    {
      title: 'Completed',
      value: '45',
      icon: CheckCircle2,
      description: '2 this month',
      trend: '+5% completion rate',
      trendUp: true,
    },
    {
      title: 'Delayed',
      value: '2',
      icon: AlertCircle,
      description: 'Requires attention',
      trend: '-1 from last month',
      trendUp: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <div className={`text-xs mt-2 ${
                stat.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 