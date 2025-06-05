'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  Award
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Performance() {
  const [timeframe, setTimeframe] = useState('month');
  const [metrics] = useState({
    overall: 85,
    taskCompletion: 92,
    projectContribution: 78,
    timeManagement: 88,
    qualityScore: 90,
    recentAchievements: [
      {
        id: 1,
        title: 'Project Milestone Achieved',
        description: 'Completed Phase 1 of ERP Implementation ahead of schedule',
        date: '2024-03-15',
        points: 50
      },
      {
        id: 2,
        title: 'Perfect Attendance',
        description: 'Maintained 100% attendance for the month',
        date: '2024-03-01',
        points: 25
      }
    ],
    monthlyProgress: [
      { month: 'Jan', score: 82 },
      { month: 'Feb', score: 85 },
      { month: 'Mar', score: 88 },
      // Add more monthly data
    ]
  });

  const MetricCard = ({ title, value, icon: Icon, trend }) => (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center">
            <h3 className="text-2xl font-bold">{value}%</h3>
            {trend && (
              <span className="ml-2 text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {trend}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Performance Dashboard</h1>
        
        <Select
          value={timeframe}
          onValueChange={setTimeframe}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Overall Performance"
          value={metrics.overall}
          icon={Star}
          trend="+3% vs last month"
        />
        <MetricCard
          title="Task Completion"
          value={metrics.taskCompletion}
          icon={CheckCircle}
          trend="On track"
        />
        <MetricCard
          title="Project Contribution"
          value={metrics.projectContribution}
          icon={Target}
        />
        <MetricCard
          title="Time Management"
          value={metrics.timeManagement}
          icon={Clock}
          trend="Improved"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Quality of Work</span>
                  <span>{metrics.qualityScore}%</span>
                </div>
                <Progress value={metrics.qualityScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Task Completion Rate</span>
                  <span>{metrics.taskCompletion}%</span>
                </div>
                <Progress value={metrics.taskCompletion} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Project Contribution</span>
                  <span>{metrics.projectContribution}%</span>
                </div>
                <Progress value={metrics.projectContribution} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <span className="text-sm text-primary">+{achievement.points} pts</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-end justify-between">
            {metrics.monthlyProgress.map((month) => (
              <div key={month.month} className="flex flex-col items-center">
                <div
                  className="w-12 bg-primary/10 rounded-t"
                  style={{ height: `${month.score}%` }}
                >
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${month.score}%` }}
                  />
                </div>
                <span className="text-sm mt-2">{month.month}</span>
                <span className="text-sm text-muted-foreground">{month.score}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}