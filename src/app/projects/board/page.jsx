'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

const COLUMNS = {
  planning: { title: 'Planning', color: 'bg-gray-100' },
  active: { title: 'Active', color: 'bg-blue-100' },
  'on-hold': { title: 'On Hold', color: 'bg-yellow-100' },
  completed: { title: 'Completed', color: 'bg-green-100' },
  cancelled: { title: 'Cancelled', color: 'bg-red-100' }
};

export default function ProjectBoard() {
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
        const projectsByStatus = response.data.data.projects.reduce((acc, project) => {
          const status = project.status || 'planning';
          if (!acc[status]) acc[status] = [];
          acc[status].push(project);
          return acc;
        }, {});
        
        // Initialize empty arrays for statuses with no projects
        Object.keys(COLUMNS).forEach(status => {
          if (!projectsByStatus[status]) projectsByStatus[status] = [];
        });
        
        setProjects(projectsByStatus);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    try {
      // Optimistically update the UI
      const sourceProjects = [...projects[source.droppableId]];
      const destProjects = [...projects[destination.droppableId]];
      const [movedProject] = sourceProjects.splice(source.index, 1);
      movedProject.status = destination.droppableId;
      destProjects.splice(destination.index, 0, movedProject);

      setProjects({
        ...projects,
        [source.droppableId]: sourceProjects,
        [destination.droppableId]: destProjects
      });

      // Update the backend
      await api.admin.updateProjectStatus(draggableId, destination.droppableId);
      
      toast({
        title: 'Success',
        description: 'Project status updated successfully',
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      
      // Revert the UI on error
      fetchProjects();
      
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(COLUMNS).map(([status, { title, color }]) => (
            <div key={status} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{title}</h3>
                <Badge variant="secondary">{projects[status]?.length || 0}</Badge>
              </div>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] rounded-lg p-4 ${color}`}
                  >
                    {projects[status]?.map((project, index) => (
                      <Draggable
                        key={project._id}
                        draggableId={project._id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-4 p-4 bg-white"
                          >
                            <h4 className="font-medium mb-2">{project.name}</h4>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {project.description}
                            </p>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2" />
                              </div>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={project.manager?.avatar} />
                                  <AvatarFallback>
                                    {project.manager?.name?.charAt(0) || 'M'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {project.members?.length || 0} members
                                </span>
                              </div>
                            </div>
                          </Card>
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
    </div>
  );
} 