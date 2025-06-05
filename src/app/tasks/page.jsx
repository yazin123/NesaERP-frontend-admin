'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { tasksApi, projectsApi, usersApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, projectsResponse, usersResponse] = await Promise.all([
        tasksApi.getMyTasks({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          project: projectFilter !== 'all' ? projectFilter : undefined,
          assignee: assigneeFilter !== 'all' ? assigneeFilter : undefined,
          search: searchTerm || undefined
        }),
        projectsApi.getAllProjects(),
        usersApi.getUsers()
      ]);

      // Handle tasks response
      if (tasksResponse?.data?.data?.tasks) {
        setTasks(tasksResponse.data.data.tasks);
      } else if (Array.isArray(tasksResponse?.data?.data)) {
        setTasks(tasksResponse.data.data);
      } else if (Array.isArray(tasksResponse?.data)) {
        setTasks(tasksResponse.data);
      } else {
        setTasks([]);
        console.warn('Unexpected tasks response format:', tasksResponse);
      }

      // Handle projects response
      if (projectsResponse?.data?.data?.projects) {
        setProjects(projectsResponse.data.data.projects);
      } else if (Array.isArray(projectsResponse?.data?.data)) {
        setProjects(projectsResponse.data.data);
      } else if (Array.isArray(projectsResponse?.data)) {
        setProjects(projectsResponse.data);
      } else {
        setProjects([]);
        console.warn('Unexpected projects response format:', projectsResponse);
      }

      // Handle users response
      if (usersResponse?.data?.users) {
        setAssignees(usersResponse.data.users);
      } else if (Array.isArray(usersResponse?.data)) {
        setAssignees(usersResponse.data);
      } else {
        setAssignees([]);
        console.warn('No users found in response');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch data. Please try again later.',
        variant: 'destructive',
      });
      setTasks([]);
      setProjects([]);
      setAssignees([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      review: 'bg-yellow-500',
      completed: 'bg-green-500'
    };
    return colors[status.toLowerCase()] || 'bg-gray-500';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status.toLowerCase() === statusFilter;
    const matchesProject = projectFilter === 'all' || task.project?._id === projectFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignedTo?._id === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesProject && matchesAssignee;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee._id} value={assignee._id}>
                  {assignee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Link href="/tasks/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {task.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{task.project?.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {task.assignedTo?.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`bg-${task.priority}-100`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(task.deadline).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-[100px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 