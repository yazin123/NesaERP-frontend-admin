'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ProjectTaskAssignment } from './ProjectTaskAssignment';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export function ProjectTasks({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const tasks = await api.getProjectTasks(projectId);
      console.log('Project tasks:', tasks);
      setTasks(tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.admin.getProjectMembers(projectId);
      setMembers(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch team members',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Progress': return 'bg-blue-100 text-blue-800';
      case 'Not Completed': return 'bg-red-100 text-red-800';
      case 'Missed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-gray-100" />
            <CardContent className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <ProjectTaskAssignment projectId={projectId} members={members} />
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle>{task.description}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    {task.isDaily && (
                      <Badge variant="outline">Daily</Badge>
                    )}
                  </div>
                </div>
                <Avatar>
                  <AvatarImage src={task.assignedTo?.photo} />
                  <AvatarFallback>{task.assignedTo?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>
                  Assigned to: {task.assignedTo?.name}
                </div>
                {task.deadline && (
                  <div>
                    Due: {format(new Date(task.deadline), 'PPP')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found for this project.
          </div>
        )}
      </div>
    </div>
  );
} 