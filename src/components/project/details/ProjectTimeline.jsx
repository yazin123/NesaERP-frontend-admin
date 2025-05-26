'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import  api  from '@/api';
import { useToast } from '@/hooks/use-toast';

export function ProjectTimeline({ projectId }) {
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimeline();
  }, [projectId]);

  const fetchTimeline = async () => {
    try {
      setIsLoading(true);
      const [phases, history] = await Promise.all([
        api.getProjectById(projectId),
        api.getProjectHistory(projectId),
      ]);
      
      // Combine phases and history into timeline events
      const timelineEvents = [
        ...phases.data.pipeline.phases.map(phase => ({
          ...phase,
          type: 'phase',
          date: phase.startDate,
        })),
        ...history.data.map(event => ({
          ...event,
          type: 'history',
          date: event.datetime,
        })),
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      setTimeline(timelineEvents);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch timeline. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <ChevronRight className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const TimelineEvent = ({ event }) => {
    if (event.type === 'phase') {
      return (
        <div className="flex items-start gap-4">
          <div className="flex-none pt-2">
            {getStatusIcon(event.status)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{event.name}</h4>
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {new Date(event.startDate).toLocaleDateString()} - 
                  {new Date(event.endDate).toLocaleDateString()}
                </span>
              </div>
              {event.assignedTo && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{event.assignedTo.length} members</span>
                </div>
              )}
            </div>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-4">
        <div className="flex-none pt-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{event.status}</h4>
            <span className="text-sm text-muted-foreground">
              {new Date(event.datetime).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{event.description}</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.updatedBy.avatar} />
              <AvatarFallback>{event.updatedBy.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{event.updatedBy.name}</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Group timeline events by month
  const groupedTimeline = timeline.reduce((groups, event) => {
    const date = new Date(event.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(event);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedTimeline).map(([monthYear, events]) => (
        <Card key={monthYear}>
          <CardHeader>
            <CardTitle className="text-lg">{monthYear}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {events.map((event, index) => (
              <div key={`${event.type}-${event.id || index}`}>
                <TimelineEvent event={event} />
                {index < events.length - 1 && (
                  <div className="my-4 border-l-2 border-dashed border-muted ml-[7px] h-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 