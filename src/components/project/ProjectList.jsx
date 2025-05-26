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
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    subscribeToProjectUpdates();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      toast({
        title: 'Error',
        description: 'Failed to fetch projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToProjectUpdates = async () => {
    try {
      // Subscribe to notifications for all projects
      projects.forEach(async (project) => {
        await api.subscribeToProject(project.id);
      });
    } catch (err) {
      console.error('Failed to subscribe to project updates:', err);
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
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <CardDescription className="mt-2">{project.description}</CardDescription>
              </div>
              <Badge variant="outline">{project.pipeline.currentPhase}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Project Head */}
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={project.projectHead.avatar} />
                  <AvatarFallback>{project.projectHead.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Project Head</p>
                  <p className="text-sm text-muted-foreground">{project.projectHead.name}</p>
                </div>
              </div>

              {/* Point of Contact */}
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Point of Contact
                </p>
                <div className="grid gap-2">
                  {project.contacts.map((contact, index) => (
                    <div key={index} className="text-sm flex items-center justify-between">
                      <span>{contact.name}</span>
                      <span className="text-muted-foreground">{contact.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.members} Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(project.dates[0].date).toLocaleDateString()} - 
                    {new Date(project.dates[project.dates.length - 1].date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Tech Stack */}
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

              {/* Pipeline and History */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="pipeline">
                  <AccordionTrigger className="text-sm font-medium">
                    <Clock className="h-4 w-4 mr-2" />
                    Pipeline Progress
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {project.pipeline.phases.map((phase, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge className={getStatusColor(phase.status)}>
                            {phase.status}
                          </Badge>
                          <span className="text-sm">{phase.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="history">
                  <AccordionTrigger className="text-sm font-medium">
                    Recent History
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {project.history.map((item, index) => (
                        <div key={index} className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{item.status}</span>
                            <span className="text-muted-foreground">
                              {new Date(item.datetime).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{item.description}</p>
                          <p className="text-xs">Updated by {item.updatedby}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}