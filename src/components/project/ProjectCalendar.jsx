'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';
import { format, isSameDay, isValid } from 'date-fns';

export function ProjectCalendar({ filters }) {
  const [projects, setProjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.phase !== 'all') queryParams.append('phase', filters.phase);

      const response = await api.admin.getAllProjects({ params: queryParams });
      
      if (response?.data?.data?.projects) {
        setProjects(response.data.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return isValid(date);
  };

  // Get all dates that have events
  const getDatesWithEvents = () => {
    const dates = new Set();
    projects.forEach(project => {
      // Add start dates
      if (isValidDate(project.startDate)) {
        dates.add(format(new Date(project.startDate), 'yyyy-MM-dd'));
      }
      // Add end dates
      if (isValidDate(project.endDate)) {
        dates.add(format(new Date(project.endDate), 'yyyy-MM-dd'));
      }
      // Add milestone dates if any
      project.timeline?.forEach(event => {
        if (isValidDate(event.date)) {
          dates.add(format(new Date(event.date), 'yyyy-MM-dd'));
        }
      });
    });
    return Array.from(dates).map(date => new Date(date));
  };

  // Get events for selected date
  const getEventsForDate = (date) => {
    return projects.reduce((events, project) => {
      // Check project start date
      if (isValidDate(project.startDate) && isSameDay(new Date(project.startDate), date)) {
        events.push({
          type: 'start',
          project,
          title: `Project Start: ${project.name}`
        });
      }
      
      // Check project end date
      if (isValidDate(project.endDate) && isSameDay(new Date(project.endDate), date)) {
        events.push({
          type: 'end',
          project,
          title: `Project Due: ${project.name}`
        });
      }

      // Check milestone dates
      project.timeline?.forEach(event => {
        if (isValidDate(event.date) && isSameDay(new Date(event.date), date)) {
          events.push({
            type: 'milestone',
            project,
            title: event.title,
            status: event.status
          });
        }
      });

      return events;
    }, []);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="animate-pulse bg-accent/5 rounded-lg h-[400px]" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => {
              const hasEvents = getDatesWithEvents().some(eventDate => 
                isSameDay(eventDate, date)
              );
              return (
                <div className="relative w-full h-full">
                  <div>{date.getDate()}</div>
                  {hasEvents && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
              );
            }
          }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">
          Events for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        
        {selectedDateEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No events scheduled for this date</p>
        ) : (
          selectedDateEvents.map((event, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge className={getStatusColor(event.project.status)}>
                        {event.project.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {event.project.description}
                    </p>

                    <div className="flex -space-x-2 mt-3">
                      {event.project.members?.slice(0, 3).map((member) => (
                        <Avatar key={member._id} className="border-2 border-background">
                          <AvatarImage src={member.photo} />
                          <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {event.project.members?.length > 3 && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm">
                          +{event.project.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 