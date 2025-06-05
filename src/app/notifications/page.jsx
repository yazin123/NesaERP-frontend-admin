'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationService } from '@/services/notification';
import { useToast } from '@/hooks/use-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Set up WebSocket notification callback
    NotificationService.setNotificationCallback((newNotification) => {
      setNotifications(prevNotifications => [
        {
          ...newNotification,
          read: false,
          createdAt: new Date().toISOString()
        },
        ...prevNotifications
      ]);
    });

    // Initialize WebSocket connection
    NotificationService.initializeWebSocket();

    // Cleanup
    return () => {
      NotificationService.setNotificationCallback(null);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await NotificationService.getNotifications();
      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type, priority) => {
    const icons = {
      task: CheckCircle,
      project: Info,
      alert: AlertCircle,
    };
    const Icon = icons[type] || Bell;
    return <Icon className={cn(
      "h-5 w-5",
      priority === 'high' ? 'text-red-500' :
      priority === 'medium' ? 'text-yellow-500' :
      'text-blue-500'
    )} />;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const markAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(notifications.map(notification =>
        notification._id === id ? { ...notification, read: true } : notification
      ));
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No notifications to display
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification._id}
              className={cn(
                "transition-colors",
                !notification.read && "bg-muted/50"
              )}
            >
              <CardContent className="flex items-start gap-4 p-4">
                {getNotificationIcon(notification.type, notification.priority)}
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{notification.title}</h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>

                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification._id)}
                  >
                    Mark as read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 