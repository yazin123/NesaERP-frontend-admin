'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { projectsApi, organizationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, departmentsRes] = await Promise.all([
        projectsApi.getAllProjects({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          department: departmentFilter !== 'all' ? departmentFilter : undefined,
          search: searchTerm || undefined
        }),
        organizationApi.getAllDepartments()
      ]);

      // Handle projects response
      if (projectsRes?.data?.data?.projects) {
        setProjects(projectsRes.data.data.projects);
      } else if (Array.isArray(projectsRes?.data?.data)) {
        setProjects(projectsRes.data.data);
      } else if (Array.isArray(projectsRes?.data)) {
        setProjects(projectsRes.data);
      } else {
        setProjects([]);
        console.warn('Unexpected projects response format:', projectsRes);
      }

      // Handle departments response
      if (departmentsRes?.data?.data?.departments) {
        setDepartments(departmentsRes.data.data.departments);
      } else if (Array.isArray(departmentsRes?.data?.data)) {
        setDepartments(departmentsRes.data.data);
      } else if (Array.isArray(departmentsRes?.data)) {
        setDepartments(departmentsRes.data);
      } else {
        setDepartments([]);
        console.warn('Unexpected departments response format:', departmentsRes);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch data. Please try again later.',
        variant: 'destructive',
      });
      setProjects([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      on_hold: 'bg-red-500',
      completed: 'bg-green-500',
      cancelled: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
    if (!project) return false;
    const matchesSearch = (project.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (project.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || project.department?._id === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  }) : [];

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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
                {Array.isArray(departments) && departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/projects/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link href={`/projects/${project._id}`} key={project._id}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-lg font-semibold">{project.name}</span>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="space-y-4">
                    <Progress value={project.progress} className="h-2" />
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{project.team?.length || 0} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}