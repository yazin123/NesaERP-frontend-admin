'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Layers, Phone, Clock, ChevronRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.admin.getAllProjects();
      if (response?.data?.success) {
        setProjects(response.data.data || []);
        // Subscribe to notifications for all projects
        response.data.data?.forEach(async (project) => {
          try {
            await api.common.subscribeToProject(project._id);
          } catch (err) {
            console.error(`Failed to subscribe to project ${project._id}:`, err);
          }
        });
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow animate-pulse">
            <CardHeader className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchProjects}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project._id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <CardDescription className="mt-2">{project.description}</CardDescription>
              </div>
              <Badge variant="outline">{project.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Project Head */}
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={project.projectHead?.photo} />
                  <AvatarFallback>{project.projectHead?.name?.[0] || 'PH'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Project Head</p>
                  <p className="text-sm text-muted-foreground">{project.projectHead?.name}</p>
                </div>
              </div>

              {/* Point of Contact */}
              {project.pointOfContact?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Point of Contact
                  </p>
                  <div className="grid gap-2">
                    {project.pointOfContact.map((contact, index) => (
                      <div key={index} className="text-sm flex items-center justify-between">
                        <span>{contact.name}</span>
                        <span className="text-muted-foreground">{contact.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.members?.length || 0} Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(project.startDate).toLocaleDateString()} - 
                    {new Date(project.expectedEndDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Progress */}
              {project.progress !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              )}

              {/* Tech Stack */}
              {project.techStack?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tech Stack</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pipeline and History */}
              {project.pipeline && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="pipeline">
                    <AccordionTrigger className="text-sm font-medium">
                      <Clock className="h-4 w-4 mr-2" />
                      Pipeline Progress
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {Object.entries(project.pipeline).map(([phase, data], index) => {
                          if (phase === 'developmentPhases') {
                            return data.map((devPhase, devIndex) => (
                              <div key={`dev-${devIndex}`} className="flex items-center gap-2">
                                <Badge className={getStatusColor(devPhase.status)}>
                                  {devPhase.status}
                                </Badge>
                                <span className="text-sm">{devPhase.phaseName}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ));
                          }
                          if (typeof data === 'object' && data.status) {
                            return (
                              <div key={phase} className="flex items-center gap-2">
                                <Badge className={getStatusColor(data.status)}>
                                  {data.status}
                                </Badge>
                                <span className="text-sm">{phase.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}