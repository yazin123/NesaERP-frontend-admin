import api from './config';

export const reportsApi = {
  // Daily reports
  submitDailyReports: (data) => api.post('/daily-reports', data),
  getDailyReports: (params) => api.get('/daily-reports', { params }),
  updateDailyReport: (reportId, data) => api.put(`/daily-reports/${reportId}`, data),
  deleteDailyReport: (reportId) => api.delete(`/daily-reports/${reportId}`),

  // Dashboard stats
  getDashboardStats: () => api.get('/dashboard'),

  // Project reports
  getProjectReports: (projectId, params) => api.get('/daily-reports', { params: { projectId, ...params } }),
  createProjectReport: (data) => api.post(`/admin/projects/${data.projectId}/reports`, data),
  updateProjectReport: (projectId, reportId, data) => api.put(`/admin/projects/${projectId}/reports/${reportId}`, data),
  deleteProjectReport: (projectId, reportId) => api.delete(`/admin/projects/${projectId}/reports/${reportId}`),

  // Performance reports
  getPerformanceMetrics: (params) => api.get('/admin/performance/metrics', { params }),
  getDepartmentPerformance: (departmentId, params) => api.get(`/admin/performance/departments/${departmentId}`, { params }),
  getEmployeePerformance: (employeeId, params) => api.get(`/admin/performance/employees/${employeeId}`, { params }),

  // Project metrics
  getProjectMetrics: (params) => api.get('/admin/projects/metrics', { params }),
  getProjectStats: () => api.get('/admin/projects/stats'),

  // User metrics
  getUserMetrics: (params) => api.get('/admin/users/metrics', { params }),
};

export default reportsApi; 