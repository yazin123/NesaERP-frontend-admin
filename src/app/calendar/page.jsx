'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { calendarApi } from '@/api';

const CalendarPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    type: '',
    time: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await calendarApi.getEvents();
      setEvents((response.data?.data || []).map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      })));
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const eventTypes = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'task', label: 'Task' },
    { value: 'reminder', label: 'Reminder' }
  ];

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await calendarApi.createEvent(newEvent);
      setEvents([...events, response.data.data]);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        type: '',
        time: ''
      });
      toast({
        title: 'Success',
        description: 'Event created successfully'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event',
        variant: 'destructive'
      });
    }
  };

  const renderEventIndicator = (day) => {
    if (!day) return null;
    
    const date = new Date(day);
    const eventsOnDay = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });

    if (eventsOnDay.length === 0) return null;

    return (
      <div className="flex gap-1 mt-1">
        {eventsOnDay.map((event, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: event.color || '#4CAF50' }}
            title={event.title}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading calendar...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          className="w-full"
          tileContent={({ date }) => (
            <div className="flex flex-col items-center">
              {renderEventIndicator(date)}
            </div>
          )}
          DayContent={({ date }) => {
            if (!date || !(date instanceof Date)) {
              return <div>Invalid date</div>;
            }
            return (
              <div className="flex flex-col items-center">
                <span>{date.getDate()}</span>
                {renderEventIndicator(date)}
              </div>
            );
          }}
          formatDay={(locale, date) => {
            if (!date || !(date instanceof Date)) {
              return '';
            }
            return date.getDate().toString();
          }}
          onClickDay={(value) => {
            if (value && value instanceof Date) {
              // Handle day click
              console.log('Clicked day:', value);
            }
          }}
        />
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Events</h2>
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow p-4 flex items-center"
            >
              <div
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: event.color || '#4CAF50' }}
              />
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(event.start).toLocaleDateString()} -{' '}
                  {new Date(event.end).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 