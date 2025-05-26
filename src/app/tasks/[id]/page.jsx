import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Clock,
    Flag,
    Paperclip,
    MessageSquare,
    Pencil,
    User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import api from '@/api';

export const metadata = {
    title: 'Task Details | ERP System',
    description: 'View task details in the ERP system'
};

async function getTask(id) {
    try {
        const response = await api.getTask(id);
        return response.data;
    } catch (error) {
        console.log('Error fetching task:', error);
        return null;
    }
}

const statusVariants = {
    todo: 'secondary',
    in_progress: 'default',
    review: 'warning',
    done: 'success'
};

const priorityVariants = {
    high: 'destructive',
    medium: 'warning',
    low: 'default'
};

function TaskSkeleton() {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    <Skeleton className="h-9 w-48" />
                </h1>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card className="md:col-span-2">
                    <CardContent className="pt-6">
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-20 w-full mb-4" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    </CardContent>
                </Card>

                {/* Project */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-24" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>

                {/* Assignees */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-24" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-8 w-8 rounded-full" />
                            ))}
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4" />
                                    <div>
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-48 mt-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Attachments */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-24" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <React.Fragment key={i}>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-4 w-4" />
                                        <div>
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-24 mt-1" />
                                        </div>
                                    </div>
                                    {i === 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Comments */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-24" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <React.Fragment key={i}>
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="h-4 w-4 mt-1" />
                                        <div>
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-16 w-full mt-1" />
                                            <Skeleton className="h-4 w-32 mt-1" />
                                        </div>
                                    </div>
                                    {i === 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default async function TaskDetailsPage({ params }) {
    const task = await getTask(params.id);

    if (!task) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-2">Task not found</h1>
                <p className="text-muted-foreground">
                    The requested task could not be found.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Task Details</h1>
                <Button asChild>
                    <Link href={`/tasks/${task._id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Task
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card className="md:col-span-2">
                    <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-2">
                            {task.title}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {task.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <Badge variant={statusVariants[task.status]}>
                                {task.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant={priorityVariants[task.priority]}>
                                <Flag className="h-3 w-3 mr-1" />
                                {task.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(task.dueDate), 'MMM dd, yyyy HH:mm')}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Project */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-medium">{task.project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {task.project.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Assignees */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assignees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AvatarGroup>
                            {task.assignees.map(assignee => (
                                <Avatar key={assignee._id}>
                                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                    <AvatarFallback>
                                        {assignee.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </AvatarGroup>
                        <div className="mt-4 space-y-3">
                            {task.assignees.map(assignee => (
                                <div key={assignee._id} className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{assignee.name}</p>
                                        <p className="text-sm text-muted-foreground">{assignee.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Attachments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attachments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {task.attachments.map((attachment, index) => (
                                <React.Fragment key={index}>
                                    <div className="flex items-center gap-3">
                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{attachment.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(attachment.uploadedAt), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    {index < task.attachments.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                            {task.attachments.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No attachments
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Comments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {task.comments.map((comment, index) => (
                                <React.Fragment key={index}>
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{comment.author.name}</p>
                                            <p className="mt-1">{comment.content}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    {index < task.comments.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                            {task.comments.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No comments
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 