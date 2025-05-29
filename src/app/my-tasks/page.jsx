'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.common.getMyTasks({
        status: filters.status,
        priority: filters.priority,
        search: filters.search
      });
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
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

  const handleViewTask = (taskId) => {
    router.push(`/my-tasks/${taskId}`);
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.common.updateTaskStatus(taskId, { status: newStatus });
      await fetchTasks();
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

  const filteredTasks = tasks.filter(task => {
    if (filters.status && filters.status !== 'all') {
      const statusMap = {
        'assigned': 'Assigned',
        'progress': 'Progress',
        'completed': 'Completed',
        'not_completed': 'Not Completed',
        'missed': 'Missed'
      };
      if (task.status !== statusMap[filters.status]) return false;
    }
    if (filters.priority && filters.priority !== 'all') {
      const priorityMap = {
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
      };
      if (task.priority !== priorityMap[filters.priority]) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        task.description?.toLowerCase().includes(searchLower) ||
        task.assignedTo?.name?.toLowerCase().includes(searchLower) ||
        task.project?.name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Tasks</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="max-w-xs"
        />
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="not_completed">Not Completed</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.priority}
          onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card key={task._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2 cursor-pointer" onClick={() => handleViewTask(task._id)}>
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
                  {task.deadline && (
                    <div className="text-sm text-muted-foreground">
                      Due: {format(new Date(task.deadline), 'PPP')}
                    </div>
                  )}
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleUpdateStatus(task._id, value)}
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
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found.
          </div>
        )}
      </div>
    </div>
  );
} 