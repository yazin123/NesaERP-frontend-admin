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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, TrendingUp, Star, Target, Award, Users, Search } from 'lucide-react';
import { reportsApi, organizationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function PerformanceReports() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [performanceData, setPerformanceData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedDepartment, selectedTimeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [performanceRes, departmentsRes] = await Promise.all([
        reportsApi.getPerformanceMetrics({ 
          departmentId: selectedDepartment === 'all' ? undefined : selectedDepartment,
          timeframe: selectedTimeframe
        }),
        organizationApi.getAllDepartments()
      ]);

      if (performanceRes.data) {
        setPerformanceData(performanceRes.data);
      }

      if (departmentsRes.data) {
        setDepartments(departmentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch performance data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const timeframes = ['week', 'month', 'quarter', 'year'];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-500',
      pending: 'bg-yellow-500',
      overdue: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading || !performanceData) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Performance Reports</h1>
          
          <div className="flex gap-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((tf) => (
                  <SelectItem key={tf} value={tf}>
                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold">{performanceData.summary.averagePerformance}%</div>
                <div className={performanceData.summary.improvementRate >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {performanceData.summary.improvementRate >= 0 ? '+' : ''}{performanceData.summary.improvementRate}% vs last {selectedTimeframe}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(performanceData.performanceDistribution).map(([level, percentage]) => (
                  <div key={level}>
                    <div className="flex justify-between text-sm">
                      <span>{level.charAt(0).toUpperCase() + level.slice(1)} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold">{performanceData.summary.totalEvaluations}</div>
                <div className="text-sm text-muted-foreground">
                  {performanceData.summary.pendingReviews} Pending Reviews
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {performanceData.departmentPerformance.map((dept) => (
                  <div key={dept._id} className="flex justify-between text-sm">
                    <span>{dept.name}</span>
                    <span className={dept.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {dept.score}% ({dept.trend === 'up' ? '↑' : '↓'}{Math.abs(dept.change)}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.keyMetrics.map((metric) => (
                  <div key={metric.category}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{metric.category}</span>
                      <span className={getScoreColor(metric.current)}>{metric.current}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={(metric.current / metric.target) * 100} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground">Target: {metric.target}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {metric.current >= metric.previous ? (
                        <span className="text-green-500">↑ {metric.current - metric.previous}%</span>
                      ) : (
                        <span className="text-red-500">↓ {metric.previous - metric.current}%</span>
                      )} vs previous {selectedTimeframe}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.recentEvaluations.map((evaluation) => (
                    <TableRow key={evaluation._id}>
                      <TableCell>{evaluation.employee}</TableCell>
                      <TableCell>{evaluation.department}</TableCell>
                      <TableCell>
                        <span className={getScoreColor(evaluation.score)}>{evaluation.score}%</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(evaluation.status)}>
                          {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 