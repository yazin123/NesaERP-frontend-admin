import api from './config';

export const tasksApi = {
  // Personal tasks
  getMyTasks: () => api.get('/tasks/my-tasks'),
  getTaskDetails: (taskId) => api.get(`/tasks/${taskId}`),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  createTask: (data) => api.post('/tasks', data),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),

  // Admin tasks
  getAllTasks: () => api.get('/admin/tasks'),
  getTaskById: (taskId) => api.get(`/admin/tasks/${taskId}`),
  updateAdminTask: (taskId, data) => api.put(`/admin/tasks/${taskId}`, data),
  deleteAdminTask: (taskId) => api.delete(`/admin/tasks/${taskId}`),

  // Project tasks
  getProjectTasks: (projectId) => api.get(`/projects/${projectId}/tasks`),
  createProjectTask: (projectId, task) => api.post(`/projects/${projectId}/tasks`, task),
  updateProjectTask: (projectId, taskId, task) => api.put(`/projects/${projectId}/tasks/${taskId}`, task),
  deleteProjectTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  assignProjectTasks: (projectId, data) => api.post(`/projects/${projectId}/assign-tasks`, data),
};

export default tasksApi; 