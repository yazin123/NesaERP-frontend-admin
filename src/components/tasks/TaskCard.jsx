'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    CalendarIcon, 
    CheckCircleIcon,
    ClockIcon, 
    LinkIcon,
    PaperclipIcon
} from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns';

const statusColors = {
    todo: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    review: 'bg-purple-500',
    completed: 'bg-green-500',
    blocked: 'bg-red-500'
};

const priorityColors = {
    low: 'bg-blue-200 text-blue-700',
    medium: 'bg-yellow-200 text-yellow-700',
    high: 'bg-orange-200 text-orange-700',
    urgent: 'bg-red-200 text-red-700'
};

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
    const [isLoading, setIsLoading] = useState(false);
    const isOverdue = isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'completed';

    const handleStatusChange = async (newStatus) => {
        try {
            setIsLoading(true);
            await onStatusChange(task.id, newStatus);
        } catch (error) {
            console.error('Error updating task status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await onDelete(task.id);
        } catch (error) {
            console.error('Error deleting task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <Link href={`/tasks/${task.id}`} className="hover:underline">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                    </Link>
                    <Badge className={statusColors[task.status]}>
                        {task.status.replace('_', ' ')}
                    </Badge>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={priorityColors[task.priority]}>
                        {task.priority}
                    </Badge>
                    {isOverdue && (
                        <Badge variant="destructive">Overdue</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                </p>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{task.estimatedHours}h estimated</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={task.assignee.photo} alt={task.assignee.name} />
                            <AvatarFallback>
                                {task.assignee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {task.attachments?.length > 0 && (
                                <div className="flex items-center">
                                    <PaperclipIcon className="w-4 h-4 mr-1" />
                                    {task.attachments.length}
                                </div>
                            )}
                            {task.dependencies?.length > 0 && (
                                <div className="flex items-center">
                                    <LinkIcon className="w-4 h-4 mr-1" />
                                    {task.dependencies.length}
                                </div>
                            )}
                            {task.subtasks?.length > 0 && (
                                <div className="flex items-center">
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange('completed')}
                        disabled={isLoading || task.status === 'completed'}
                    >
                        Complete
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(task)}
                        disabled={isLoading}
                    >
                        Edit
                    </Button>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isLoading}
                >
                    {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
            </CardFooter>
        </Card>
    );
} 