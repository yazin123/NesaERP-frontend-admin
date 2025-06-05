import api from './config';

export const notificationsApi = {
  // Personal notifications
  getMyNotifications: () => api.get('/notifications'),
  markNotificationAsRead: (id) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export default notificationsApi; 