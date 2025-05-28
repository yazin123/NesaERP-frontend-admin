'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function ProjectList({ filters, onFilterChange }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.phase !== 'all') queryParams.append('phase', filters.phase);
      if (filters.priority !== 'all') queryParams.append('priority', filters.priority);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);
      queryParams.append('sort', filters.sort);

      const response = await api.admin.getAllProjects({ params: queryParams });
      
      if (response?.data?.data) {
        setProjects(response.data.data.projects);
        setTotalPages(response.data.data.totalPages);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
      toast({
        title: 'Error',
        description: 'Failed to fetch projects. Please try again.',
        variant: 'destructive',
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = end - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchProjects} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No projects found
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {projects.map(project => (
              <Link key={project._id} href={`/projects/${project._id}`}>
                <Card className="hover:bg-accent/5 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              {project.members?.length || 0} members
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              {calculateDaysRemaining(project.endDate)} days remaining
                            </div>
                          </div>

                          {project.isDelayed && (
                            <div className="flex items-center gap-2 text-destructive">
                              <AlertCircle className="h-4 w-4" />
                              <div className="text-sm">Delayed</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full md:w-64 space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex -space-x-2">
                          {project.members?.slice(0, 5).map((member, index) => (
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

                      <ChevronRight className="hidden md:block h-6 w-6 text-muted-foreground self-center" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page === 1}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => onFilterChange('page', i + 1)}
                    isActive={filters.page === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
}