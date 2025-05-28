//src/api/index.js
import axios from "axios";
import { setupCache } from 'axios-cache-interceptor';

const api = setupCache(
  axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    },
    // Retry configuration
    retry: {
      retries: 3,
      retryCondition: (error) => {
        return axios.isRetryableError(error) && error.response?.status !== 401;
      },
      retryDelay: (retryCount) => retryCount * 1000, // Progressive delay
    }
  })
);

// Request queue for offline support
let requestQueue = [];
const isOnline = () => typeof window !== 'undefined' && window.navigator.onLine;

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!config.url.includes('/login')) {
      // If no token and not a login request, reject immediately
      return Promise.reject(new Error('No authentication token'));
    }

    // Handle FormData requests
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    // Queue requests if offline
    if (!isOnline() && config.method !== 'get') {
      requestQueue.push(config);
      throw new Error('Offline - Request queued');
    }

    // Log request
    console.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 
      config.method !== 'get' ? config.data : '');

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response
    console.debug(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, 
      response.data);
    return response;
  },
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403 || error.message === 'No authentication token') {
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already there and not a login request
      if (window.location.pathname !== '/' && !error.config?.url?.includes('/login')) {
        // Use replace to prevent back navigation to protected routes
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);

// Process queued requests when back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    const queue = [...requestQueue];
    requestQueue = [];
    for (const config of queue) {
      try {
        await api(config);
    } catch (error) {
        console.error('Failed to process queued request:', error);
      }
    }
  });
}

// Common endpoints (available to all authenticated users)
const common = {
  // Auth
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/current'),
  changePassword: (userId, data) => api.put(`/users/${userId}/change-password`, data),
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photo') {
        if (data[key]) formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Dashboard
  getMyDashboardStats: () => api.get('/dashboard'),

  // Personal notifications
  getMyNotifications: () => api.get('/notifications'),
  markNotificationAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getNotificationPreferences: () => api.get('/notifications/preferences'),
  updateNotificationPreferences: (preferences) => api.put('/notifications/preferences', preferences),

  // Personal tasks
  getMyTasks: (params) => api.get('/tasks/my-tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  updateTaskStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  addTaskComment: (id, comment) => api.post(`/tasks/${id}/comments`, { comment }),

  // Personal projects
  getMyProjects: (params) => api.get('/projects/my-projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  subscribeToProject: (projectId) => api.post(`/notifications/subscribe/project/${projectId}`),
  unsubscribeFromProject: (projectId) => api.delete(`/notifications/subscribe/project/${projectId}`),

  // Basic system status
  getBasicSystemStatus: () => api.get('/system/status'),

  // Daily reports
  submitDailyReports: (data) => api.post('/daily-reports', data),
  getDailyReports: (params) => api.get('/daily-reports', { params }),
  updateDailyReport: (reportId, data) => api.put(`/daily-reports/${reportId}`, data),
  deleteDailyReport: (reportId) => api.delete(`/daily-reports/${reportId}`),
};

// Admin-only endpoints
const admin = {
  // User management
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getManagers: () => api.get('/admin/users/managers'),
  getUserById: (id) => api.get(`/admin/users/${id}`),

  createUser: ( data) => {
    const formData = new FormData();
    
    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      return api.post(`/admin/users`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    // Convert data to FormData
    Object.keys(data).forEach(key => {
      if (key === 'photo' || key === 'resume') {
        if (data[key]) formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    return api.put(`/admin/users`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateUser: (id, data) => {
    const formData = new FormData();
    
    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      return api.put(`/admin/users/update/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    // Convert data to FormData
    Object.keys(data).forEach(key => {
      if (key === 'photo' || key === 'resume') {
        if (data[key]) formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    return api.put(`/admin/users/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Alias employee endpoints to user endpoints for backward compatibility
  getEmployees: (params) => api.get('/admin/users', { params: { ...params } }),
  getEmployeeById: (id) => api.get(`/admin/users/${id}`),
  createEmployee: (data) => admin.createUser({ ...data, type: 'employee' }),
  updateEmployee: (id, data) => admin.updateUser(id, { ...data, type: 'employee' }),
  deleteEmployee: (id) => admin.deleteUser(id),

  // Project management
  getAllProjects: (params) => api.get('/admin/projects', params),
  getProjectStats: () => api.get('/admin/projects/stats'),
  getProjectById: (id) => api.get(`/admin/projects/${id}`),
  createProject: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'files') {
        if (data[key]) {
          data[key].forEach(file => formData.append('files', file));
        }
      } else if (key === 'startDate' || key === 'endDate') {
        formData.append(key, data[key].toISOString());
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/admin/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateProject: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'files') {
        if (data[key]) {
          data[key].forEach(file => formData.append('files', file));
        }
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/admin/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),
  updateProjectStatus: (id, status, reason) => api.patch(`/admin/projects/${id}/status`, { status, reason }),
  updateProjectPipeline: (id, data) => api.patch(`/admin/projects/${id}/pipeline`, data),
  
  // Project team
  getProjectMembers: (id) => api.get(`/admin/projects/${id}/team`),
  addProjectMembers: (id, members) => api.post(`/admin/projects/${id}/team`, { members }),
  removeProjectMember: (id, memberId) => api.delete(`/admin/projects/${id}/team/${memberId}`),
  updateMemberRole: (id, memberId, role) => api.put(`/admin/projects/${id}/team/${memberId}`, { role }),
  
  // Project timeline
  getProjectTimeline: (id) => api.get(`/admin/projects/${id}/timeline`),
  addTimelineEvent: (id, event) => api.post(`/admin/projects/${id}/timeline`, event),
  updateTimelineEvent: (projectId, eventId, event) => api.put(`/admin/projects/${projectId}/timeline/${eventId}`, event),
  deleteTimelineEvent: (projectId, eventId) => api.delete(`/admin/projects/${projectId}/timeline/${eventId}`),
  
  // Project tasks
  getProjectTasks: (id) => api.get(`/admin/projects/${id}/tasks`),
  createProjectTask: (id, task) => api.post(`/admin/projects/${id}/tasks`, task),
  updateProjectTask: (projectId, taskId, task) => api.put(`/admin/projects/${projectId}/tasks/${taskId}`, task),
  deleteProjectTask: (projectId, taskId) => api.delete(`/admin/projects/${projectId}/tasks/${taskId}`),
  
  // Team members by tech stack
  getTeamMembersByTechStack: () => api.get('/admin/projects/team-members/tech-stack'),

  // Performance management
  getUserPerformance: (userId) => api.get(`/admin/performance/${userId}`),
  updatePerformance: (userId, data) => api.put(`/admin/performance/${userId}`, data),

  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),

  // System monitoring
  getSystemMetrics: () => api.get('/admin/monitoring/detailed-metrics'),
  getEmailQueueStatus: () => api.get('/admin/monitoring/email-queue'),
  getSystemHealth: () => api.get('/admin/monitoring/health'),
  clearFailedEmails: () => api.post('/admin/monitoring/email-queue/clear-failed'),

  // Project Documents
  getProjectDocuments: (projectId) => api.get(`/admin/projects/${projectId}/documents`),
  uploadProjectDocument: (projectId, data) => {
    const formData = new FormData();
    if (data.files) {
      data.files.forEach(file => formData.append('files', file));
    }
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }
    return api.post(`/admin/projects/${projectId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProjectDocument: (projectId, documentId) => api.delete(`/admin/projects/${projectId}/documents/${documentId}`),

  // Project reports
  getProjectReports: (projectId, params) => api.get('/daily-reports', { params: { projectId, ...params } }),
  createProjectReport: (data) => api.post(`/admin/projects/${data.projectId}/reports`, data),
  updateProjectReport: (projectId, reportId, data) => api.put(`/admin/projects/${projectId}/reports/${reportId}`, data),
  deleteProjectReport: (projectId, reportId) => api.delete(`/admin/projects/${projectId}/reports/${reportId}`),
};

// Create the final API object with proper type checking
const apiObject = {
  ...common,
  admin
};

// Export the API object
export default apiObject;