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
import { Download, Users, Star, Clock, Target, TrendingUp, Search } from 'lucide-react';
import { reportsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function UserReports() {
  const [timeframe, setTimeframe] = useState('month');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [timeframe, departmentFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, departmentsRes] = await Promise.all([
        reportsApi.getUserMetrics({ timeframe, department: departmentFilter === 'all' ? undefined : departmentFilter }),
        reportsApi.getAllDepartments()
      ]);

      if (usersRes.data) {
        setReportData(usersRes.data);
      }

      if (departmentsRes.data) {
        setDepartments(departmentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user reports. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const timeframes = ['week', 'month', 'quarter', 'year'];

  if (loading || !reportData) {
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
          <h1 className="text-2xl font-bold">User Reports</h1>
          
          <div className="flex gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
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

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
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
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold">{reportData.summary.totalEmployees}</div>
                <div className="text-sm text-muted-foreground">
                  {reportData.summary.activeEmployees} Active
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">New Hires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold">{reportData.summary.newHires}</div>
                <div className="text-sm text-green-500">
                  This {timeframe}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold">{reportData.summary.averagePerformance}%</div>
                <div className="text-sm text-muted-foreground">
                  {reportData.summary.topPerformers} Top Performers
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Department Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(reportData.summary.departmentDistribution).map(([dept, count]) => (
                  <div key={dept} className="flex justify-between text-sm">
                    <span>{dept}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.performanceMetrics.map((metric) => (
                  <div key={metric.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{metric.category}</span>
                      <div className="flex items-center gap-2">
                        <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                          {metric.score}%
                        </span>
                        <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                          {metric.trend === 'up' ? '↑' : '↓'}{metric.change}%
                        </span>
                      </div>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.departmentPerformance.map((dept) => (
                  <div key={dept._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{dept.name}</span>
                      <span>{dept.employeeCount} Employees</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-green-500">Active: {dept.activeCount}</div>
                      <div className="text-blue-500">New: {dept.newHires}</div>
                      <div className="text-yellow-500">Performance: {dept.avgPerformance}%</div>
                    </div>
                    <Progress value={dept.avgPerformance} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 