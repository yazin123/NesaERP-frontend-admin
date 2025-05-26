'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit,
    Trash2,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    User
} from 'lucide-react';
import api from '@/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TaskList = () => {
    const router = useRouter();
    const { user } = useAuth();
    
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        project: '',
        assignee: '',
        search: '',
        page: 1,
        rowsPerPage: 10
    });
    const [showFilters, setShowFilters] = useState(false);

    // Status options
    const statusOptions = [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'review', label: 'In Review' },
        { value: 'completed', label: 'Completed' },
        { value: 'blocked', label: 'Blocked' }
    ];

    // Priority options
    const priorityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    useEffect(() => {
        fetchTasks();
    }, [filters]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.getTasks(filters);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(id);
                fetchTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'default';
            case 'review':
                return 'warning';
            case 'blocked':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getPriorityBadgeVariant = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high':
            case 'urgent':
                return 'destructive';
            case 'medium':
                return 'warning';
            case 'low':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const filteredTasks = tasks?.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
    );

    const paginatedTasks = filteredTasks?.slice(
        (filters.page - 1) * filters.rowsPerPage,
        filters.page * filters.rowsPerPage
    );

    const totalPages = Math.ceil(filteredTasks?.length / filters.rowsPerPage);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Tasks</h1>
                {['admin', 'teamlead', 'projectmanager'].includes(user?.role) && (
                    <Button asChild>
                        <Link href="/tasks/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Task
                        </Link>
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search tasks..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex gap-4"
                        >
                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange('status', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    {statusOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.priority}
                                onValueChange={(value) => handleFilterChange('priority', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    {priorityOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTasks?.map((task) => (
                                <TableRow key={task._id}>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">{task.title}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                {task.description}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/projects/${task.project._id}`}
                                            className="text-sm hover:underline"
                                        >
                                            {task.project.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                                                <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{task.assignee.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                {format(new Date(task.dueDate), 'PP')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(task.status)}>
                                            {task.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getPriorityBadgeVariant(task.priority)}>
                                            {task.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-[100px]">
                                            <Progress value={task.progress} className="h-2" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/tasks/${task._id}`}>
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                {['admin', 'teamlead', 'projectmanager'].includes(user?.role) && (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/tasks/${task._id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {user?.role === 'admin' && (
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteTask(task._id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                                disabled={filters.page === 1}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    onClick={() => handleFilterChange('page', pageNum)}
                                    isActive={filters.page === pageNum}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                                disabled={filters.page === totalPages}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

export default TaskList; 