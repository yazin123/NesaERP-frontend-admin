import api from './config';

const tasksApi = {
  // Task management
  getMyTasks: (params) => api.get('/tasks/my-tasks', { params }),
  getAllTasks: (params) => api.get('/admin/tasks', { params }),
  getTaskById: (id) => api.get(`/admin/tasks/${id}`),
  createTask: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachments' && data[key]) {
        data[key].forEach(file => formData.append('attachments', file));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
    });
    return api.post('/admin/tasks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateTask: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachments' && data[key]) {
        data[key].forEach(file => formData.append('attachments', file));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
    });
    return api.put(`/admin/tasks/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteTask: (id) => api.delete(`/admin/tasks/${id}`),
  updateTaskStatus: (id, status) => api.patch(`/admin/tasks/${id}/status`, { status }),
  
  // Task comments
  getTaskComments: (taskId) => api.get(`/admin/tasks/${taskId}/comments`),
  addTaskComment: (taskId, comment) => api.post(`/admin/tasks/${taskId}/comments`, { comment }),
  deleteTaskComment: (taskId, commentId) => api.delete(`/admin/tasks/${taskId}/comments/${commentId}`),
  
  // Task attachments
  getTaskAttachments: (taskId) => api.get(`/admin/tasks/${taskId}/attachments`),
  addTaskAttachment: (taskId, file) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post(`/admin/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteTaskAttachment: (taskId, attachmentId) => api.delete(`/admin/tasks/${taskId}/attachments/${attachmentId}`),

  // Project tasks
  getProjectTasks: (projectId) => api.get(`/admin/projects/${projectId}/tasks`),
  createProjectTask: (projectId, task) => api.post(`/admin/projects/${projectId}/tasks`, task),
  updateProjectTask: (projectId, taskId, task) => api.put(`/admin/projects/${projectId}/tasks/${taskId}`, task),
  deleteProjectTask: (projectId, taskId) => api.delete(`/admin/projects/${projectId}/tasks/${taskId}`),
  assignProjectTasks: (projectId, data) => api.post(`/admin/projects/${projectId}/assign-tasks`, data),
};

export default tasksApi; 