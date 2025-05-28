'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Users, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/api';

export function ProjectGrid({ filters }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, [filters]);


  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.phase !== 'all') queryParams.append('phase', filters.phase);
      queryParams.append('sort', 'startDate');

      const response = await api.admin.getAllProjects({ params: queryParams });
      
      if (response?.data?.data?.projects) {
        setProjects(response.data.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'active': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'on-hold': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateProgress = (project) => {
    if (!project.pipeline) return 0;
    
    let totalPhases = 0;
    let completedPhases = 0;

    // Count fixed stages
    ['requirementGathering', 'architectCreation', 'architectSubmission'].forEach(stage => {
      totalPhases++;
      if (project.pipeline[stage]?.status === 'completed') completedPhases++;
    });

    // Count development phases
    if (project.pipeline.developmentPhases) {
      project.pipeline.developmentPhases.forEach(phase => {
        totalPhases++;
        if (phase.status === 'completed') completedPhases++;
      });
    }

    return totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
  };

  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-gray-100" />
            <CardContent className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects?.map((project) => (
        <Card
          key={project._id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push(`/projects/${project._id}`)}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge className={getStatusColor(project.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(project.status)}
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </Badge>
              <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'}>
                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
              </Badge>
            </div>
            <CardTitle className="line-clamp-1">{project.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.members?.length || 0} Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{calculateDaysRemaining(project.expectedEndDate)} Days Left</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">{calculateProgress(project)}%</span>
                </div>
                <Progress value={calculateProgress(project)} />
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={project.projectHead?.photo} />
                  <AvatarFallback>{project.projectHead?.name?.charAt(0) || 'P'}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground line-clamp-1">
                  {project.projectHead?.name}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 