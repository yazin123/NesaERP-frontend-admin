'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export default function TaskDetails({ taskId, isAdmin = false }) {
  const [task, setTask] = useState(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setIsLoading(true);
      const response = await (isAdmin 
        ? api.admin.getTaskById(taskId)
        : api.common.getTaskById(taskId));
      setTask(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch task details',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.common.updateTaskStatus(taskId, { status: newStatus });
      await fetchTaskDetails();
      toast({
        title: 'Success',
        description: 'Task status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  const handleAddComment = async () => {
    try {
      await api.common.addTaskComment(taskId, { comment });
      setComment('');
      await fetchTaskDetails();
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
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
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-1/4" />
        <div className="h-24 bg-gray-100 rounded" />
        <div className="h-12 bg-gray-100 rounded w-1/2" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Task not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle>{task.description}</CardTitle>
              {task.project && (
                <div className="text-sm text-muted-foreground">
                  Project: {task.project.name}
                </div>
              )}
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
            <div className="flex flex-col items-end gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Assigned to:</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.assignedTo?.photo} />
                  <AvatarFallback>{task.assignedTo?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              {task.deadline && (
                <div className="text-sm text-muted-foreground">
                  Due: {format(new Date(task.deadline), 'PPP')}
                </div>
              )}
              {!isAdmin && (
                <Select
                  value={task.status}
                  onValueChange={handleUpdateStatus}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Not Completed">Not Completed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button onClick={handleAddComment} disabled={!comment.trim()}>
                Add Comment
              </Button>
            </div>

            <div className="space-y-4 mt-6">
              {task.comments?.map((comment) => (
                <div key={comment._id} className="flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.photo} />
                    <AvatarFallback>{comment.user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{comment.user?.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.createdAt), 'PPp')}
                      </span>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}

              {(!task.comments || task.comments.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No comments yet.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 