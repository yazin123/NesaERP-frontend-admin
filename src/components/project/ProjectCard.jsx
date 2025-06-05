'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, ClockIcon, UsersIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
    planning: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    on_hold: 'bg-orange-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
};

const priorityColors = {
    low: 'bg-blue-200 text-blue-700',
    medium: 'bg-yellow-200 text-yellow-700',
    high: 'bg-orange-200 text-orange-700',
    urgent: 'bg-red-200 text-red-700'
};

export default function ProjectCard({ project, onEdit, onDelete }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await onDelete(project.id);
        } catch (error) {
            console.error('Error deleting project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                        <CardTitle className="text-xl">{project.name}</CardTitle>
                    </Link>
                    <Badge className={statusColors[project.status]}>
                        {project.status.replace('_', ' ')}
                    </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className={priorityColors[project.priority]}>
                        {project.priority}
                    </Badge>
                    <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(project.startDate), { addSuffix: true })}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                </p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <UsersIcon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex -space-x-2">
                            {project.members.slice(0, 3).map((member) => (
                                <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                                    <AvatarImage src={member.photo} alt={member.name} />
                                    <AvatarFallback>
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {project.members.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                    +{project.members.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDistanceToNow(new Date(project.endDate))} left</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(project)}
                >
                    Edit
                </Button>
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