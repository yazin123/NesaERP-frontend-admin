'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Milestone, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';
import { format, isValid } from 'date-fns';

export function ProjectTimeline({ filters }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (project) => {
    const start = project.startDate ? new Date(project.startDate) : new Date();
    const end = project.endDate ? new Date(project.endDate) : new Date();
    
    if (!isValid(start) || !isValid(end)) {
      return 0;
    }

    const today = new Date();
    const total = end - start;
    const current = today - start;
    return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const timelineProgress = calculateProgress(project);
        const endDate = project.endDate ? new Date(project.endDate) : null;
        const isDelayed = endDate && isValid(endDate) && new Date() > endDate && project.status !== 'completed';

        return (
          <Card key={project._id} className="relative">
            <div 
              className="absolute top-0 left-0 h-full bg-accent/5" 
              style={{ width: `${timelineProgress}%` }}
            />
            <CardContent className="relative p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-32 text-sm text-muted-foreground">
                  {formatDate(project.startDate)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    {isDelayed && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Delayed
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due: {formatDate(project.endDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Progress: {project.progress}%</span>
                    </div>
                  </div>

                  {project.timeline && project.timeline.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {project.timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="flex-shrink-0 w-24 text-muted-foreground">
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Milestone className="h-4 w-4 text-muted-foreground" />
                            <span>{event.title}</span>
                            {event.status === 'completed' && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex -space-x-2 mt-4">
                    {project.members?.slice(0, 5).map((member) => (
                      <Avatar key={member._id} className="border-2 border-background">
                        <AvatarImage src={member.photo} />
                        <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members?.length > 5 && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm">
                        +{project.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 