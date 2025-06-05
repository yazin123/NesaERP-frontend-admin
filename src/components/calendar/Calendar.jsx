'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { tasksApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const response = await tasksApi.getTasksByDateRange({
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });

      if (response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch calendar events. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getEventsByDate = (date) => {
    return events.filter(event => isSameDay(new Date(event.dueDate), date));
  };

  const getEventColor = (event) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[event.priority] || 'bg-blue-500';
  };

  const previousMonth = () => {
    setCurrentDate(date => {
      const newDate = new Date(date.getFullYear(), date.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(date => {
      const newDate = new Date(date.getFullYear(), date.getMonth() + 1);
      return newDate;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-7 gap-4">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Calendar</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-40 text-center font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/tasks/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-background p-2 text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}
          {days.map((date, dayIdx) => {
            const dayEvents = getEventsByDate(date);
            return (
              <div
                key={date.toString()}
                className={cn(
                  'min-h-24 bg-background p-2',
                  !isSameMonth(date, currentDate) && 'text-muted-foreground',
                  'relative group'
                )}
              >
                <time
                  dateTime={format(date, 'yyyy-MM-dd')}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-sm',
                    isToday(date) && 'bg-primary text-primary-foreground',
                    !isToday(date) && 'text-foreground'
                  )}
                >
                  {format(date, 'd')}
                </time>
                <div className="space-y-1 mt-2">
                  {dayEvents.slice(0, 3).map((event) => (
                    <Link
                      key={event._id}
                      href={`/tasks/${event._id}`}
                      className="block"
                    >
                      <Badge
                        className={cn(
                          'w-full truncate text-left justify-start',
                          getEventColor(event)
                        )}
                      >
                        {event.title}
                      </Badge>
                    </Link>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 