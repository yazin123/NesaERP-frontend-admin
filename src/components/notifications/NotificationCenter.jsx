'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
    Bell,
    CheckCircle2,
    Clock,
    Settings,
    Trash2,
    RefreshCw,
    Filter,
    Mail,
    MessageSquare,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { notificationsApi } from '@/api';

export function NotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        projectUpdates: true,
        taskAssignments: true,
        deadlineReminders: true,
        performanceReviews: true
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        fetchNotifications();
        fetchPreferences();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationsApi.getNotifications();
            if (response.data && response.data.notifications) {
                setNotifications(response.data.notifications);
            } else {
                throw new Error('Invalid response format');
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

    const fetchPreferences = async () => {
        try {
            const response = await notificationsApi.getNotificationPreferences();
            setPreferences(response.data);
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationsApi.markAsRead(notificationId);
            setNotifications(notifications.map(n => 
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to mark notification as read',
                variant: 'destructive',
            });
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast({
                title: 'Success',
                description: 'All notifications marked as read',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to mark all notifications as read',
                variant: 'destructive',
            });
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationsApi.deleteNotification(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
            toast({
                title: 'Success',
                description: 'Notification deleted',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete notification',
                variant: 'destructive',
            });
        }
    };

    const updatePreferences = async (key, value) => {
        try {
            const newPreferences = { ...preferences, [key]: value };
            await notificationsApi.updateNotificationPreferences(newPreferences);
            setPreferences(newPreferences);
            toast({
                title: 'Success',
                description: 'Preferences updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update preferences',
                variant: 'destructive',
            });
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'PROJECT_UPDATE': return MessageSquare;
            case 'TASK_ASSIGNMENT': return CheckCircle2;
            case 'DEADLINE_REMINDER': return Clock;
            case 'EMAIL': return Mail;
            case 'ALERT': return AlertTriangle;
            default: return Bell;
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read;
        return notification.type === filter;
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Notifications</h1>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={markAllAsRead}
                        className="flex items-center gap-2"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark all as read
                    </Button>
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={fetchNotifications}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="notifications" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle>Recent Notifications</CardTitle>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <select
                                    className="text-sm bg-transparent border-none focus:outline-none"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="unread">Unread</option>
                                    <option value="PROJECT_UPDATE">Project Updates</option>
                                    <option value="TASK_ASSIGNMENT">Task Assignments</option>
                                    <option value="DEADLINE_REMINDER">Deadline Reminders</option>
                                    <option value="EMAIL">Emails</option>
                                    <option value="ALERT">Alerts</option>
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px] pr-4">
                                <div className="space-y-4">
                                    {filteredNotifications.map((notification) => {
                                        const Icon = getNotificationIcon(notification.type);
                                        return (
                                            <div
                                                key={notification.id}
                                                className={`flex items-start gap-4 p-4 rounded-lg border ${
                                                    notification.read ? 'bg-background' : 'bg-muted'
                                                }`}
                                            >
                                                <Icon className="h-5 w-5 text-primary mt-1" />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium">{notification.title}</p>
                                                        <div className="flex items-center gap-2">
                                                            {!notification.read && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => markAsRead(notification.id)}
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteNotification(notification.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline">
                                                            {notification.type.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="font-medium">Email Notifications</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications via email
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.emailNotifications}
                                        onCheckedChange={(checked) => 
                                            updatePreferences('emailNotifications', checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="font-medium">Push Notifications</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Receive browser push notifications
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.pushNotifications}
                                        onCheckedChange={(checked) => 
                                            updatePreferences('pushNotifications', checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="font-medium">Project Updates</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications about project changes
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.projectUpdates}
                                        onCheckedChange={(checked) => 
                                            updatePreferences('projectUpdates', checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="font-medium">Task Assignments</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications about new task assignments
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.taskAssignments}
                                        onCheckedChange={(checked) => 
                                            updatePreferences('taskAssignments', checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="font-medium">Deadline Reminders</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications about upcoming deadlines
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.deadlineReminders}
                                        onCheckedChange={(checked) => 
                                            updatePreferences('deadlineReminders', checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="font-medium">Performance Reviews</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications about performance reviews
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.performanceReviews}
                                        onCheckedChange={(checked) => 
                                            updatePreferences('performanceReviews', checked)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 