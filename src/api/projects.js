import api from './config';

export const projectsApi = {
  // Project management
  getAllProjects: (params) => api.get('/admin/projects', { params }),
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
  updateProjectStatus: (id, status, reason) => {
    const data = typeof status === 'object' ? status : { status, reason };
    return api.patch(`/admin/projects/${id}/status`, data);
  },
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

  // Project tasks
  getProjectTasks: (projectId) => api.get(`/projects/${projectId}/tasks`),
  createProjectTask: (projectId, task) => api.post(`/projects/${projectId}/tasks`, task),
  updateProjectTask: (projectId, taskId, task) => api.put(`/projects/${projectId}/tasks/${taskId}`, task),
  deleteProjectTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  assignProjectTasks: (projectId, data) => api.post(`/projects/${projectId}/assign-tasks`, data),

  // Project metrics
  getProjectMetrics: (projectId) => api.get(`/admin/projects/${projectId}/metrics`),
};

export default projectsApi; 