import api from './api';

export const projectService = {
    // Get all projects
    getAllProjects: async (filters = {}) => {
        const response = await api.get('/projects', { params: filters });
        return response.data;
    },

    // Get project by ID
    getProjectById: async (id) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    // Create new project
    createProject: async (projectData) => {
        const response = await api.post('/projects', projectData);
        return response.data;
    },

    // Update project
    updateProject: async (id, projectData) => {
        const response = await api.put(`/projects/${id}`, projectData);
        return response.data;
    },

    // Delete project
    deleteProject: async (id) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    },

    // Get project tasks
    getProjectTasks: async (projectId, filters = {}) => {
        const response = await api.get(`/projects/${projectId}/tasks`, { params: filters });
        return response.data;
    },

    // Add member to project
    addProjectMember: async (projectId, userData) => {
        const response = await api.post(`/projects/${projectId}/members`, userData);
        return response.data;
    },

    // Remove member from project
    removeProjectMember: async (projectId, userId) => {
        const response = await api.delete(`/projects/${projectId}/members/${userId}`);
        return response.data;
    },

    // Get project statistics
    getProjectStats: async (projectId) => {
        const response = await api.get(`/projects/${projectId}/statistics`);
        return response.data;
    },

    // Get project timeline
    getProjectTimeline: async (projectId) => {
        const response = await api.get(`/projects/${projectId}/timeline`);
        return response.data;
    },

    // Update project status
    updateProjectStatus: async (projectId, status) => {
        const response = await api.patch(`/projects/${projectId}/status`, { status });
        return response.data;
    },

    // Get project documents
    getProjectDocuments: async (projectId) => {
        const response = await api.get(`/projects/${projectId}/documents`);
        return response.data;
    },

    // Upload project document
    uploadProjectDocument: async (projectId, formData) => {
        const response = await api.post(`/projects/${projectId}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Delete project document
    deleteProjectDocument: async (projectId, documentId) => {
        const response = await api.delete(`/projects/${projectId}/documents/${documentId}`);
        return response.data;
    },

    // Get project risks
    getProjectRisks: async (projectId) => {
        const response = await api.get(`/projects/${projectId}/risks`);
        return response.data;
    },

    // Add project risk
    addProjectRisk: async (projectId, riskData) => {
        const response = await api.post(`/projects/${projectId}/risks`, riskData);
        return response.data;
    },

    // Update project risk
    updateProjectRisk: async (projectId, riskId, riskData) => {
        const response = await api.put(`/projects/${projectId}/risks/${riskId}`, riskData);
        return response.data;
    },

    // Get project performance metrics
    getProjectPerformance: async (projectId, timeRange) => {
        const response = await api.get(`/projects/${projectId}/performance`, { params: timeRange });
        return response.data;
    }
}; 