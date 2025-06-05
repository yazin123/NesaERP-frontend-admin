'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, Plus, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { projectsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function ProjectBoard() {
  const [selectedProject, setSelectedProject] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getMyProjects();
      
      if (response?.data?.data?.projects) {
        setProjects(response.data.data.projects);
      } else if (Array.isArray(response?.data?.data)) {
        setProjects(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setProjects(response.data);
      } else {
        setProjects([]);
        console.warn('Unexpected projects response format:', response);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch projects. Please try again later.',
        variant: 'destructive',
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'planning', title: 'Planning' },
    { id: 'active', title: 'Active' },
    { id: 'on_hold', title: 'On Hold' },
    { id: 'completed', title: 'Completed' }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority.toLowerCase()] || 'bg-gray-500';
  };

  const getColumnProjects = (status) => {
    return projects.filter(project => {
      const matchesProject = selectedProject === 'all' || project._id === selectedProject;
      return project.status.toLowerCase() === status && matchesProject;
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-24 bg-muted rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
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

      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => (
          <Card key={column.id}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {column.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getColumnProjects(column.id).map((project) => (
                  <Card key={project._id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{project.name}</h3>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{project.members?.length || 0} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Progress: {project.progress}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 