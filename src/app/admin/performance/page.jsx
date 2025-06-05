'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Search, Download, Users, Star, TrendingUp, Calendar } from 'lucide-react';
import { reportsApi, usersApi, organizationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminPerformance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  });
  const [performanceData, setPerformanceData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedEmployee, selectedDepartment, selectedDateRange, searchTerm]);

  const fetchInitialData = async () => {
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        usersApi.getUsers({ type: 'employee' }),
        organizationApi.getAllDepartments()
      ]);

      if (employeesRes?.data?.users) {
        setEmployees(employeesRes.data.users);
      }

      if (departmentsRes?.data) {
        setDepartments(departmentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employee data. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getEmployeePerformance({
        employeeId: selectedEmployee === 'all' ? undefined : selectedEmployee,
        departmentId: selectedDepartment === 'all' ? undefined : selectedDepartment,
        startDate: selectedDateRange.from,
        endDate: selectedDateRange.to,
        search: searchTerm || undefined
      });

      if (response?.data) {
        setPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch performance data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRatingBadge = (rating) => {
    const colors = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      average: 'bg-yellow-500',
      poor: 'bg-red-500'
    };
    return colors[rating.toLowerCase()] || 'bg-gray-500';
  };

  if (loading || !performanceData) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Employee Performance Management</h1>
          
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Department" />
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

              <DatePickerWithRange
                date={selectedDateRange}
                setDate={setSelectedDateRange}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold">{performanceData.summary.averageScore}%</div>
                <div className={performanceData.summary.trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {performanceData.summary.trend >= 0 ? '↑' : '↓'} {Math.abs(performanceData.summary.trend)}% from previous period
                </div>
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
                  {performanceData.summary.pendingEvaluations} Pending Reviews
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {performanceData.topPerformers.slice(0, 3).map((performer) => (
                  <div key={performer._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{performer.name}</span>
                    </div>
                    <span className={getScoreColor(performer.score)}>{performer.score}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Tasks Completed</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Overall Rating</TableHead>
                  <TableHead>Last Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.designation}</div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{employee.tasksCompleted}</span>
                        <span className="text-sm text-muted-foreground">/ {employee.totalTasks}</span>
                      </div>
                    </TableCell>
                    <TableCell>{employee.attendance}%</TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="flex items-center gap-2">
                          <Progress value={employee.qualityScore} className="h-2" />
                          <span className="text-sm">{employee.qualityScore}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRatingBadge(employee.rating)}>
                        {employee.rating}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(employee.lastReview).toLocaleDateString()}
                      </div>
                    </TableCell>
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