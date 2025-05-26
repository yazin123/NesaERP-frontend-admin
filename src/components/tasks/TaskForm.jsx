'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Paperclip,
    Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import api from '@/api';

const TaskForm = ({ task = null }) => {
    const router = useRouter();
    const isEdit = !!task;

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: task?.title || '',
            description: task?.description || '',
            status: task?.status || 'todo',
            priority: task?.priority || 'medium',
            dueDate: task?.dueDate ? new Date(task.dueDate) : null,
            assignees: task?.assignees || [],
            project: task?.project || null,
            attachments: task?.attachments || []
        }
    });

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(true);
    const [error, setError] = useState('');
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [files, setFiles] = useState([]);

    const statusOptions = [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'review', label: 'In Review' },
        { value: 'done', label: 'Done' }
    ];

    const priorityOptions = [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
    ];

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            const [employeesRes, projectsRes] = await Promise.all([
                api.getEmployees(),
                api.getProjects()
            ]);
            setEmployees(employeesRes.data);
            setProjects(projectsRes.data);
        } catch (error) {
            console.error('Error fetching form data:', error);
            setError('Failed to load form data');
        } finally {
            setFormLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');

            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'dueDate') {
                    formData.append(key, data[key]?.toISOString() || '');
                } else {
                    formData.append(key, data[key]);
                }
            });

            files.forEach(file => {
                formData.append('attachments', file);
            });

            if (isEdit) {
                await api.updateTask(task._id, formData);
            } else {
                await api.createTask(formData);
            }

            router.push('/tasks');
        } catch (error) {
            console.error('Error submitting task:', error);
            setError('Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        setFiles([...files, ...event.target.files]);
    };

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    if (formLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 flex-1" />
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {isEdit ? 'Edit Task' : 'Create Task'}
                    </h1>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid gap-6">
                                <div className="grid gap-4">
                                    <Controller
                                        name="title"
                                        control={control}
                                        rules={{ required: 'Title is required' }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Title</label>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter task title"
                                                    error={errors.title?.message}
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Description</label>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Enter task description"
                                                    rows={4}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name="status"
                                        control={control}
                                        rules={{ required: 'Status is required' }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Status</label>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map(option => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="priority"
                                        control={control}
                                        rules={{ required: 'Priority is required' }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Priority</label>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {priorityOptions.map(option => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="dueDate"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Due Date</label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start text-left font-normal"
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="project"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Project</label>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select project" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {projects.map(project => (
                                                            <SelectItem
                                                                key={project._id}
                                                                value={project._id}
                                                            >
                                                                {project.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Attachments</label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.querySelector('input[type="file"]').click()}
                                        >
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            Add Files
                                        </Button>
                                    </div>
                                    {files.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {files.map((file, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="flex items-center gap-2"
                                                >
                                                    {file.name}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 p-0"
                                                        onClick={() => handleRemoveFile(index)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? 'Saving...' : 'Save Task'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </motion.div>
        </div>
    );
};

export default TaskForm; 