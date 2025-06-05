import { notificationsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export const NotificationService = {
  getNotifications: async () => {
    try {
      const response = await notificationsApi.getMyNotifications();
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await notificationsApi.markNotificationAsRead(notificationId);
      return response;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await notificationsApi.markAllNotificationsAsRead();
      return response;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await notificationsApi.deleteNotification(notificationId);
      return response;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  },

  subscribeToProjectUpdates: async (projectId) => {
    try {
      const response = await notificationsApi.subscribeToProject(projectId);
      return response;
    } catch (error) {
      console.error('Failed to subscribe to project updates:', error);
      throw error;
    }
  },

  unsubscribeFromProjectUpdates: async (projectId) => {
    try {
      const response = await notificationsApi.unsubscribeFromProject(projectId);
      return response;
    } catch (error) {
      console.error('Failed to unsubscribe from project updates:', error);
      throw error;
    }
  },

  getNotificationPreferences: async () => {
    try {
      const response = await notificationsApi.getNotificationPreferences();
      return response;
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      throw error;
    }
  },

  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await notificationsApi.updateNotificationPreferences(preferences);
      return response;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  },

  setNotificationCallback: (callback) => {
    notificationCallback = callback;
  },

  initializeWebSocket: () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found for WebSocket connection');
      return;
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
      ws = new WebSocket(`${wsUrl}/notifications?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          handleNotification(notification);
          // Call the callback to update the notification list
          if (notificationCallback) {
            notificationCallback(notification);
          }
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        handleReconnection();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (ws.readyState === WebSocket.CLOSED) {
          handleReconnection();
        }
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      handleReconnection();
    }
  }
};

// WebSocket connection variables
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;
let notificationCallback = null;

const handleReconnection = () => {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
    setTimeout(NotificationService.initializeWebSocket, RECONNECT_DELAY);
  } else {
    console.error('Max reconnection attempts reached');
  }
};

// Handle incoming notifications
const handleNotification = (notification) => {
  if (!notification || !notification.type) {
    console.error('Invalid notification format:', notification);
    return;
  }

  try {
    // Show toast notification
    const { toast } = useToast();
    switch (notification.type) {
      case 'PROJECT_DATE_REMINDER':
        toast({
          title: 'Project Date Reminder',
          description: notification.message,
          duration: 5000,
        });
        break;

      case 'PROJECT_ASSIGNMENT':
        toast({
          title: 'New Project Assignment',
          description: notification.message,
          duration: 5000,
        });
        break;

      case 'PHASE_UPDATE':
        toast({
          title: 'Project Phase Update',
          description: notification.message,
          duration: 5000,
        });
        break;

      case 'DAILY_REPORT_REMINDER':
        toast({
          title: 'Daily Report Reminder',
          description: notification.message,
          duration: 5000,
          variant: 'destructive',
        });
        break;

      default:
        toast({
          title: notification.title || 'Notification',
          description: notification.message,
          duration: 5000,
        });
    }
  } catch (error) {
    console.error('Failed to handle notification:', error);
  }
};

// Initialize WebSocket connection and handle reconnection
if (typeof window !== 'undefined') {
  NotificationService.initializeWebSocket();

  // Reinitialize WebSocket when token changes
  window.addEventListener('storage', (event) => {
    if (event.key === 'authToken') {
      if (ws) {
        ws.close();
      }
      if (event.newValue) {
        reconnectAttempts = 0; // Reset reconnect attempts
        NotificationService.initializeWebSocket();
      }
    }
  });
} 