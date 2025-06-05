'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { reportsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    tasks: z.array(z.object({
        task: z.string().min(1, 'Task is required'),
        hoursSpent: z.number().min(0).max(24),
        workDone: z.string().min(1, 'Work description is required'),
        status: z.enum(['in_progress', 'completed', 'blocked'])
    })),
    summary: z.string().min(1, 'Summary is required'),
    plannedTasksForTomorrow: z.array(z.object({
        description: z.string().min(1, 'Task description is required'),
        estimatedHours: z.number().min(0).max(24)
    }))
});

export default function DailyReportForm({ onSubmit, initialData, isLoading }) {
    const [error, setError] = useState('');

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tasks: initialData?.tasks || [{ task: '', hoursSpent: 0, workDone: '', status: 'in_progress' }],
            summary: initialData?.summary || '',
            plannedTasksForTomorrow: initialData?.plannedTasksForTomorrow || [{ description: '', estimatedHours: 0 }]
        }
    });

    const { fields: taskFields, append: appendTask, remove: removeTask } = useFieldArray({
        control: form.control,
        name: 'tasks'
    });

    const { fields: plannedFields, append: appendPlanned, remove: removePlanned } = useFieldArray({
        control: form.control,
        name: 'plannedTasksForTomorrow'
    });

    const handleSubmit = async (data) => {
        try {
            setError('');
            await onSubmit(data);
            form.reset();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Daily Report</CardTitle>
            </CardHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Today's Tasks</h3>
                        {taskFields.map((field, index) => (
                            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-2">
                                        <Label>Task</Label>
                                        <Input
                                            {...form.register(`tasks.${index}.task`)}
                                            placeholder="Task name or ID"
                                        />
                                        {form.formState.errors.tasks?.[index]?.task && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.tasks[index].task.message}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeTask(index)}
                                        disabled={taskFields.length === 1}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Hours Spent</Label>
                                        <Input
                                            type="number"
                                            {...form.register(`tasks.${index}.hoursSpent`, { valueAsNumber: true })}
                                            min="0"
                                            max="24"
                                        />
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select
                                            onValueChange={(value) => form.setValue(`tasks.${index}.status`, value)}
                                            defaultValue={field.status}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="blocked">Blocked</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Work Done</Label>
                                    <Textarea
                                        {...form.register(`tasks.${index}.workDone`)}
                                        placeholder="Describe what you accomplished"
                                    />
                                </div>

                                {form.watch(`tasks.${index}.status`) === 'blocked' && (
                                    <div>
                                        <Label>Blockers</Label>
                                        <Textarea
                                            {...form.register(`tasks.${index}.blockers`)}
                                            placeholder="Describe what's blocking this task"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendTask({ task: '', hoursSpent: 0, workDone: '', status: 'in_progress' })}
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Task
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Daily Summary</Label>
                        <Textarea
                            {...form.register('summary')}
                            placeholder="Provide a summary of your day"
                        />
                        {form.formState.errors.summary && (
                            <p className="text-sm text-destructive">{form.formState.errors.summary.message}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Tomorrow's Plan</h3>
                        {plannedFields.map((field, index) => (
                            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-2">
                                        <Label>Task Description</Label>
                                        <Input
                                            {...form.register(`plannedTasksForTomorrow.${index}.description`)}
                                            placeholder="What do you plan to work on?"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePlanned(index)}
                                        disabled={plannedFields.length === 1}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div>
                                    <Label>Estimated Hours</Label>
                                    <Input
                                        type="number"
                                        {...form.register(`plannedTasksForTomorrow.${index}.estimatedHours`, { valueAsNumber: true })}
                                        min="0"
                                        max="24"
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendPlanned({ description: '', estimatedHours: 0 })}
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Planned Task
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
} 