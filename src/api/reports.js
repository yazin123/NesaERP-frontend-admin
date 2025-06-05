import api from './config';

const reportsApi = {
  // Daily reports
  getDailyReports: (params) => api.get('/admin/daily-reports', { params }),
  submitDailyReport: (data) => api.post('/admin/daily-reports', data),
  updateDailyReport: (id, data) => api.put(`/admin/daily-reports/${id}`, data),
  deleteDailyReport: (id) => api.delete(`/admin/daily-reports/${id}`),

  // Project reports
  getProjectReports: (projectId, params) => api.get(`/admin/projects/${projectId}/reports`, { params }),
  createProjectReport: (projectId, data) => api.post(`/admin/projects/${projectId}/reports`, data),
  updateProjectReport: (projectId, reportId, data) => api.put(`/admin/projects/${projectId}/reports/${reportId}`, data),
  deleteProjectReport: (projectId, reportId) => api.delete(`/admin/projects/${projectId}/reports/${reportId}`),

  // Department reports
  getDepartmentReports: (departmentId, params) => api.get(`/admin/departments/${departmentId}/reports`, { params }),
  createDepartmentReport: (departmentId, data) => api.post(`/admin/departments/${departmentId}/reports`, data),
  updateDepartmentReport: (departmentId, reportId, data) => api.put(`/admin/departments/${departmentId}/reports/${reportId}`, data),
  deleteDepartmentReport: (departmentId, reportId) => api.delete(`/admin/departments/${departmentId}/reports/${reportId}`),

  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard'),

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