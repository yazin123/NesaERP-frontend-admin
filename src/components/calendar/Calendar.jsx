'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

const eventColors = {
  task: '#3b82f6', // blue
  milestone: '#10b981', // green
  meeting: '#f59e0b', // yellow
  deadline: '#ef4444', // red
  phase: '#8b5cf6', // purple
};

export function Calendar() {
  const [events, setEvents] = useState([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'meeting',
    projectId: '',
  });
  const [projects, setProjects] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCalendarData();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.admin.getAllProjects();
      if (response?.data?.data?.projects) {
        setProjects(response.data.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's tasks
      const tasksResponse = await api.getMyTasks();
      const tasks = tasksResponse.data.data || [];

      // Fetch user's projects
      const projectsResponse = await api.getMyProjects();
      const projects = projectsResponse.data.data || [];

      // Transform tasks into calendar events
      const taskEvents = tasks.map(task => ({
        id: `task-${task._id}`,
        title: `Task: ${task.description}`,
        start: task.deadline ? new Date(task.deadline) : new Date(task.createdAt),
        end: task.deadline ? new Date(task.deadline) : new Date(task.createdAt),
        backgroundColor: getTaskColor(task.status),
        borderColor: getTaskColor(task.status),
        extendedProps: {
          type: 'task',
          description: task.description,
          status: task.status,
          priority: task.priority,
          projectName: task.project?.name
        }
      }));

      // Transform project milestones into calendar events
      const projectEvents = projects.flatMap(project => {
        const events = [];

        // Project start and end dates
        if (project.startDate) {
          events.push({
            id: `project-start-${project._id}`,
            title: `Project Start: ${project.name}`,
            start: new Date(project.startDate),
            allDay: true,
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            extendedProps: {
              type: 'project',
              description: `Project ${project.name} starts`,
              status: project.status
            }
          });
        }

        if (project.endDate) {
          events.push({
            id: `project-end-${project._id}`,
            title: `Project Deadline: ${project.name}`,
            start: new Date(project.endDate),
            allDay: true,
            backgroundColor: '#f44336',
            borderColor: '#f44336',
            extendedProps: {
              type: 'project',
              description: `Project ${project.name} deadline`,
              status: project.status
            }
          });
        }

        // Project timeline events
        if (project.timeline && Array.isArray(project.timeline)) {
          project.timeline.forEach(event => {
            if (event.date) {
              events.push({
                id: `project-event-${project._id}-${event._id}`,
                title: event.title,
                start: new Date(event.date),
                allDay: true,
                backgroundColor: getEventTypeColor(event.type),
                borderColor: getEventTypeColor(event.type),
                extendedProps: {
                  type: event.type,
                  description: event.description,
                  status: event.status,
                  projectName: project.name
                }
              });
            }
          });
        }

        return events;
      });

      setEvents([...taskEvents, ...projectEvents]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch calendar data. Please try again.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const getTaskColor = (status) => {
    const colors = {
      'Pending': '#FFA726',
      'Progress': '#29B6F6',
      'Completed': '#66BB6A',
      'Cancelled': '#EF5350',
      'Assigned': '#AB47BC'
    };
    return colors[status] || '#757575';
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'milestone': '#8E24AA',
      'meeting': '#FB8C00',
      'deliverable': '#00897B',
      'phase': '#5C6BC0'
    };
    return colors[type] || '#757575';
  };

  const formatPhaseTitle = (phase) => {
    return phase
      .replace(/([A-Z])/g, ' $1')
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^./, str => str.toUpperCase());
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const props = event.extendedProps;
    
    toast({
      title: event.title,
      description: `${props.description}${props.status ? `\nStatus: ${props.status}` : ''}`,
    });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.admin.addTimelineEvent(newEvent.projectId, {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.start,
        type: newEvent.type
      });

      if (response?.data?.success) {
        setIsAddEventOpen(false);
        setNewEvent({
          title: '',
          description: '',
          start: '',
          end: '',
          type: 'meeting',
          projectId: ''
        });
        await fetchCalendarData();
        toast({
          title: 'Success',
          description: 'Event added successfully'
        });
      }
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: 'Error',
        description: 'Failed to add event',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="space-y-4 p-8 mx-auto max-w-7xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Calendar</CardTitle>
          <Button onClick={() => setIsAddEventOpen(true)}>Add Event</Button>
        </CardHeader>
        <CardContent>
          <div className="h-[800px]">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
              }}
              initialView="dayGridMonth"
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              eventClick={handleEventClick}
              loading={loading}
              height="auto"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Add a new event to the project timeline
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select
                value={newEvent.projectId}
                onValueChange={(value) => setNewEvent(prev => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Event title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) => setNewEvent(prev => ({ ...prev, start: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={newEvent.type}
                onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="deliverable">Deliverable</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddEventOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 