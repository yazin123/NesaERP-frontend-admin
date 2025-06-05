import api from './config';

export const monitoringApi = {
  // System monitoring
  getSystemMetrics: () => api.get('/admin/monitoring/metrics'),
  getSystemLogs: (params) => api.get('/admin/monitoring/logs', { params }),
  getSystemStatus: () => api.get('/admin/monitoring/status'),
  clearSystemLogs: () => api.post('/admin/monitoring/logs/clear'),
  restartService: (service) => api.post(`/admin/monitoring/services/${service}/restart`),

  // Email queue monitoring
  getEmailQueueStatus: () => api.get('/admin/monitoring/email-queue'),
  clearFailedEmails: () => api.post('/admin/monitoring/email-queue/clear-failed'),

  // Performance monitoring
  getPerformanceMetrics: (params) => api.get('/admin/performance/metrics', { params }),
  getDepartmentPerformance: (departmentId, params) => api.get(`/admin/performance/departments/${departmentId}`, { params }),
  getEmployeePerformance: (employeeId, params) => api.get(`/admin/performance/employees/${employeeId}`, { params }),
  updateEmployeePerformance: (employeeId, data) => api.put(`/admin/performance/employees/${employeeId}`, data),

  // Basic system status (for non-admin users)
  getBasicSystemStatus: () => api.get('/system/status'),

  // Dashboard statistics
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

export default monitoringApi; 