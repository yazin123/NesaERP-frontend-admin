import api from '@/api';
import { toast } from '@/components/ui/use-toast';

export const NotificationService = {
  getNotifications: async () => {
    return api.get('/notifications');
  },

  markAsRead: async (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return api.put('/notifications/read-all');
  },

  deleteNotification: async (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },

  subscribeToProjectUpdates: async (projectId) => {
    return api.post(`/notifications/subscribe/project/${projectId}`);
  },

  unsubscribeFromProjectUpdates: async (projectId) => {
    return api.delete(`/notifications/subscribe/project/${projectId}`);
  },

  getNotificationPreferences: async () => {
    return api.get('/notifications/preferences');
  },

  updateNotificationPreferences: async (preferences) => {
    return api.put('/notifications/preferences', preferences);
  }
};

// WebSocket connection for real-time notifications
let ws = null;

export const initializeWebSocket = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  ws = new WebSocket(`${wsUrl}/notifications?token=${token}`);

  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    handleNotification(notification);
  };

  ws.onclose = () => {
    // Attempt to reconnect after 5 seconds
    setTimeout(initializeWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    // Attempt to reconnect after 5 seconds
    setTimeout(initializeWebSocket, 5000);
  };
};

// Handle incoming notifications
const handleNotification = (notification) => {
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
};

// Initialize WebSocket connection and handle reconnection
if (typeof window !== 'undefined') {
  initializeWebSocket();

  // Reinitialize WebSocket when token changes
  window.addEventListener('storage', (event) => {
    if (event.key === 'authToken') {
      if (ws) {
        ws.close();
      }
      if (event.newValue) {
        initializeWebSocket();
      }
    }
  });
} 