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
  created: { 
    title: 'Created', 
    color: 'bg-gray-100',
    description: 'Newly created projects'
  },
  active: { 
    title: 'Active', 
    color: 'bg-blue-100',
    description: 'Projects ready to start'
  },
  'on-progress': { 
    title: 'In Progress', 
    color: 'bg-yellow-100',
    description: 'Projects being worked on'
  },
  stopped: { 
    title: 'Stopped', 
    color: 'bg-orange-100',
    description: 'Projects on hold'
  },
  completed: { 
    title: 'Completed', 
    color: 'bg-green-100',
    description: 'Successfully completed'
  },
  cancelled: { 
    title: 'Cancelled', 
    color: 'bg-red-100',
    description: 'Projects cancelled'
  }
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
          const status = project.status || 'created';
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

    // Validate status transitions
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    const isValidTransition = (() => {
      switch (destStatus) {
        case 'active':
          // Can be activated from created, stopped, or cancelled status
          return sourceStatus === 'created' || sourceStatus === 'stopped' || sourceStatus === 'cancelled';
        case 'on-progress':
          // Can only be set automatically by pipeline updates
          return false;
        case 'stopped':
        case 'cancelled':
          // Can be set from any status except completed
          return sourceStatus !== 'completed';
        case 'completed':
          // Should only be set automatically when all pipeline stages are completed
          return false;
        case 'created':
          // Cannot manually move to created status
          return false;
        default:
          return false;
      }
    })();

    if (!isValidTransition) {
      toast({
        title: 'Invalid Status Change',
        description: sourceStatus === 'completed' 
          ? 'Completed projects cannot be moved to another status.'
          : destStatus === 'on-progress' || destStatus === 'completed'
          ? 'This status is set automatically based on project pipeline progress.'
          : destStatus === 'created'
          ? 'Cannot manually set a project back to created status.'
          : 'This status transition is not allowed',
        variant: 'destructive'
      });
      return;
    }

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
      const response = await api.admin.updateProjectStatus(draggableId, destination.droppableId);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to update project status');
      }
      
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
    <div className=" mx-auto max-w-9xl py-8">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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