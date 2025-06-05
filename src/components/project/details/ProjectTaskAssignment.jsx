'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { projectsApi } from '@/api';

export function ProjectTaskAssignment({ projectId, teamMembers }) {
    console.log("members", teamMembers);
  const [tasks, setTasks] = useState([{
    description: '',
    assignees: [],
    deadline: '',
    priority: 'Medium',
    isDaily: false
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddTask = () => {
    setTasks([...tasks, {
      description: '',
      assignees: [],
      deadline: '',
      priority: 'Medium',
      isDaily: false
    }]);
  };

  const handleRemoveTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index] = {
      ...newTasks[index],
      [field]: value
    };
    setTasks(newTasks);
  };

  const handleAssigneeToggle = (taskIndex, memberId) => {
    const newTasks = [...tasks];
    const task = newTasks[taskIndex];
    const assignees = task.assignees || [];

    if (assignees.includes(memberId)) {
      task.assignees = assignees.filter(id => id !== memberId);
    } else {
      task.assignees = [...assignees, memberId];
    }

    setTasks(newTasks);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate tasks
      const invalidTasks = tasks.filter(
        task => !task.description || !task.assignees || task.assignees.length === 0
      );

      if (invalidTasks.length > 0) {
        toast({
          title: 'Validation Error',
          description: 'Please ensure all tasks have a description and at least one assignee',
          variant: 'destructive'
        });
        return;
      }

      await projectsApi.assignProjectTasks(projectId, { tasks });

      toast({
        title: 'Success',
        description: 'Tasks assigned successfully'
      });

      // Reset form
      setTasks([{
        description: '',
        assignees: [],
        deadline: '',
        priority: 'Medium',
        isDaily: false
      }]);
    } catch (error) {
      console.error('Error assigning tasks:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign tasks',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Assign Tasks</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Tasks to Team Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {tasks.map((task, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Task {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Task description"
                    value={task.description}
                    onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="datetime-local"
                      value={task.deadline}
                      onChange={(e) => handleTaskChange(index, 'deadline', e.target.value)}
                    />
                  </div>
                  <div>
                    <Select
                      value={task.priority}
                      onValueChange={(value) => handleTaskChange(index, 'priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Assignees</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {teamMembers?.members?.map((member) => (
                      <div key={member._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${index}-${member._id}`}
                          checked={task.assignees.includes(member._id)}
                          onCheckedChange={() => handleAssigneeToggle(index, member._id)}
                        />
                        <label htmlFor={`${index}-${member._id}`}>{member.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`daily-${index}`}
                    checked={task.isDaily}
                    onCheckedChange={(checked) => handleTaskChange(index, 'isDaily', checked)}
                  />
                  <label htmlFor={`daily-${index}`}>Daily task</label>
                </div>

                {tasks.length > 1 && (
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveTask(index)}
                  >
                    Remove Task
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button onClick={handleAddTask}>
              Add Another Task
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Tasks'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 