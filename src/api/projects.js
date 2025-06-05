import api from './config';

const projectsApi = {
  // Project management
  getAllProjects: (params) => api.get('/admin/projects', { params }),
  getMyProjects: (params) => api.get('/projects/my-projects', { params }),
  getProjectById: (id) => api.get(`/admin/projects/${id}`),
  createProject: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'files' && data[key]) {
        data[key].forEach(file => formData.append('files', file));
      } else if (key === 'startDate' || key === 'endDate') {
        formData.append(key, data[key].toISOString());
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
    });
    return api.post('/admin/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateProject: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'files' && data[key]) {
        data[key].forEach(file => formData.append('files', file));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
    });
    return api.put(`/admin/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),
  updateProjectStatus: (id, status) => api.patch(`/admin/projects/${id}/status`, { status }),
  
  // Project updates
  getProjectUpdates: (id) => api.get(`/admin/projects/${id}/updates`),
  addProjectUpdate: (id, update) => api.post(`/admin/projects/${id}/updates`, update),

  // Project tasks
  getProjectTasks: (projectId) => api.get(`/admin/projects/${projectId}/tasks`),
  createProjectTask: (projectId, task) => api.post(`/admin/projects/${projectId}/tasks`, task),
  updateProjectTask: (projectId, taskId, task) => api.put(`/admin/projects/${projectId}/tasks/${taskId}`, task),
  deleteProjectTask: (projectId, taskId) => api.delete(`/admin/projects/${projectId}/tasks/${taskId}`),

  // Project reports
  getProjectReports: (projectId, params) => api.get(`/admin/projects/${projectId}/reports`, { params }),
  createProjectReport: (projectId, data) => api.post(`/admin/projects/${projectId}/reports`, data),
  updateProjectReport: (projectId, reportId, data) => api.put(`/admin/projects/${projectId}/reports/${reportId}`, data),
  deleteProjectReport: (projectId, reportId) => api.delete(`/admin/projects/${projectId}/reports/${reportId}`),

  // Project metrics
  getProjectMetrics: (params) => api.get('/admin/projects/metrics', { params }),
  getProjectStats: () => api.get('/admin/projects/stats'),

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
  assignProjectTasks: (projectId, data) => api.post(`/projects/${projectId}/assign-tasks`, data),
};

export default projectsApi; 