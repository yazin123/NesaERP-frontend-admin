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
import { BarChart, Calendar, Clock, Download, Filter } from 'lucide-react';
import { reportsApi, organizationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function ProjectReports() {
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
      const [projectsRes, departmentsRes] = await Promise.all([
        reportsApi.getProjectMetrics({
          timeframe,
          department: departmentFilter === 'all' ? undefined : departmentFilter
        }),
        organizationApi.getAllDepartments()
      ]);

      if (projectsRes.data) {
        setReportData(projectsRes.data);
      }

      if (departmentsRes.data) {
        setDepartments(departmentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project reports. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const timeframes = ['week', 'month', 'quarter', 'year'];

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500',
      in_progress: 'bg-blue-500',
      on_hold: 'bg-yellow-500',
      delayed: 'bg-red-500'
    };
    return colors[status.toLowerCase()] || 'bg-gray-500';
  };

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
          <h1 className="text-2xl font-bold">Project Reports</h1>
          
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
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold">{reportData.summary.totalProjects}</div>
                <div className="text-sm text-muted-foreground">
                  {reportData.summary.activeProjects} Active
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="text-green-500">{reportData.summary.completedProjects}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delayed</span>
                  <span className="text-red-500">{reportData.summary.delayedProjects}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold">{reportData.summary.averageCompletion}%</div>
                <Progress value={reportData.summary.averageCompletion} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Budget</span>
                  <span>${reportData.summary.totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Spent</span>
                  <span>${reportData.summary.totalSpent.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(reportData.summary.totalSpent / reportData.summary.totalBudget) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.departmentMetrics.map((dept) => (
                  <div key={dept._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{dept.name}</span>
                      <span>{dept.projects} Projects</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-green-500">On Track: {dept.onTrack}</div>
                      <div className="text-yellow-500">Delayed: {dept.delayed}</div>
                      <div className="text-blue-500">Completed: {dept.completed}</div>
                    </div>
                    <Progress value={dept.avgProgress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.recentProjects.map((project) => (
                    <TableRow key={project._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium">${project.spent.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            of ${project.budget.toLocaleString()}
                          </div>
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
    </div>
  );
} 