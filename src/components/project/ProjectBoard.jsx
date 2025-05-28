'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';
import Link from 'next/link';

const COLUMNS = {
  planning: { title: 'Planning', color: 'bg-purple-100' },
  active: { title: 'Active', color: 'bg-blue-100' },
  'on-hold': { title: 'On Hold', color: 'bg-yellow-100' },
  completed: { title: 'Completed', color: 'bg-green-100' },
  cancelled: { title: 'Cancelled', color: 'bg-red-100' }
};

export function ProjectBoard() {
  const [projects, setProjects] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.admin.getAllProjects();
      
      if (response?.data?.data?.projects) {
        // Group projects by status
        const groupedProjects = response.data.data.projects.reduce((acc, project) => {
          const status = project.status || 'planning';
          if (!acc[status]) acc[status] = [];
          acc[status].push(project);
          return acc;
        }, {});
        
        // Ensure all columns exist even if empty
        Object.keys(COLUMNS).forEach(status => {
          if (!groupedProjects[status]) groupedProjects[status] = [];
        });

        setProjects(groupedProjects);
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

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // No actual movement
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    try {
      // Update local state first for immediate feedback
      const sourceList = [...projects[source.droppableId]];
      const destList = source.droppableId === destination.droppableId
        ? sourceList
        : [...projects[destination.droppableId]];
      
      const [movedProject] = sourceList.splice(source.index, 1);
      destList.splice(destination.index, 0, {
        ...movedProject,
        status: destination.droppableId
      });

      setProjects(prev => ({
        ...prev,
        [source.droppableId]: sourceList,
        [destination.droppableId]: destList
      }));

      // Update project status in backend
      const response = await api.admin.updateProjectStatus(draggableId, {
        status: destination.droppableId
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to update project status');
      }

      toast({
        title: 'Success',
        description: 'Project status updated successfully'
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive'
      });
      // Revert changes on error
      fetchProjects();
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.keys(COLUMNS).map(status => (
          <div key={status} className="space-y-4">
            <div className={`p-4 rounded-lg ${COLUMNS[status].color}`}>
              <h3 className="font-semibold">{COLUMNS[status].title}</h3>
            </div>
            <div className="space-y-2">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-32" />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(COLUMNS).map(([status, { title, color }]) => (
          <div key={status} className="space-y-4">
            <div className={`p-4 rounded-lg ${color}`}>
              <h3 className="font-semibold">{title}</h3>
              <div className="text-sm text-muted-foreground mt-1">
                {projects[status]?.length || 0} projects
              </div>
            </div>

            <Droppable droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 min-h-[200px]"
                >
                  {projects[status]?.map((project, index) => (
                    <Draggable
                      key={project._id}
                      draggableId={project._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Link href={`/projects/${project._id}`}>
                            <Card className="hover:bg-accent/5 transition-colors">
                              <CardContent className="p-4 space-y-3">
                                <h4 className="font-medium line-clamp-1">
                                  {project.name}
                                </h4>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="h-4 w-4" />
                                  <span>{project.members?.length || 0} members</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{calculateDaysRemaining(project.endDate)} days left</span>
                                </div>

                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                  </div>
                                  <Progress value={project.progress} className="h-2" />
                                </div>

                                <div className="flex -space-x-2">
                                  {project.members?.slice(0, 3).map((member, index) => (
                                    <Avatar key={member._id} className="border-2 border-background">
                                      <AvatarImage src={member.photo} />
                                      <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {project.members?.length > 3 && (
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm">
                                      +{project.members.length - 3}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
} 