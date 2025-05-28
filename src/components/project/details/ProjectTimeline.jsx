'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Users,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export function ProjectTimeline({ project }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const { toast } = useToast();

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    type: 'milestone',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchEvents();
  }, [project._id]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.admin.getProjectTimeline(project._id);
      setEvents(response.data.data || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch timeline events. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await api.admin.addTimelineEvent(project._id, newEvent);
      toast({
        title: 'Success',
        description: 'Event added successfully',
      });
      setIsAddEventOpen(false);
      fetchEvents();
      setNewEvent({
        title: '',
        description: '',
        date: '',
        type: 'milestone',
        status: 'upcoming'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    try {
      await api.admin.updateTimelineEvent(project._id, eventId, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Event status updated successfully',
      });
      fetchEvents();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update event status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'milestone': return 'bg-purple-100 text-purple-800';
      case 'deliverable': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <div>Loading timeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Timeline</h2>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Timeline Event</DialogTitle>
              <DialogDescription>
                Add a new event or milestone to the project timeline.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Input
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">Date</label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">Type</label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
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
                <Button type="submit">Add Event</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event._id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{event.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
              </div>
              <Badge className={getEventTypeColor(event.type)}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(event.status)}
                  <Select
                    value={event.status}
                    onValueChange={(value) => handleUpdateEventStatus(event._id, value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 