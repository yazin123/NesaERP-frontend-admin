'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, TrendingDown, BarChart } from 'lucide-react';
import { monitoringApi, organizationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminPerformance() {
  const [timeframe, setTimeframe] = useState('month');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [performanceData, setPerformanceData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [timeframe, departmentFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [performanceRes, departmentsRes] = await Promise.all([
        monitoringApi.getPerformanceMetrics({
          timeframe,
          department: departmentFilter === 'all' ? undefined : departmentFilter
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

  if (loading || !performanceData) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
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
          <h1 className="text-2xl font-bold">Performance Overview</h1>
          <div className="flex gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
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
                <SelectValue placeholder="Filter by department" />
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {performanceData.departmentMetrics.map((dept) => (
            <Card key={dept._id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{dept.name}</span>
                  <Badge variant={dept.trend === 'up' ? 'success' : 'destructive'}>
                    {dept.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Score</span>
                      <span className={getScoreColor(dept.averageScore)}>
                        {dept.averageScore}%
                      </span>
                    </div>
                    <Progress value={dept.averageScore} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Top Performer</span>
                    <span className="font-medium">{dept.topPerformer}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Team Size</span>
                    <span>{dept.employeeCount} members</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Projects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.employeePerformance.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <span className={getScoreColor(employee.score)}>
                        {employee.score}%
                      </span>
                    </TableCell>
                    <TableCell>{employee.tasks}</TableCell>
                    <TableCell>{employee.projects}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 