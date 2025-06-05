import api from './api';

export const dailyReportService = {
    // Get all daily reports
    getAllReports: async (filters = {}) => {
        const response = await api.get('/daily-reports', { params: filters });
        return response.data;
    },

    // Get report by ID
    getReportById: async (id) => {
        const response = await api.get(`/daily-reports/${id}`);
        return response.data;
    },

    // Create new report
    createReport: async (reportData) => {
        const response = await api.post('/daily-reports', reportData);
        return response.data;
    },

    // Update report
    updateReport: async (id, reportData) => {
        const response = await api.put(`/daily-reports/${id}`, reportData);
        return response.data;
    },

    // Delete report
    deleteReport: async (id) => {
        const response = await api.delete(`/daily-reports/${id}`);
        return response.data;
    },

    // Get user's daily reports
    getUserReports: async (userId, filters = {}) => {
        const response = await api.get(`/users/${userId}/daily-reports`, { params: filters });
        return response.data;
    },

    // Get project daily reports
    getProjectReports: async (projectId, filters = {}) => {
        const response = await api.get(`/projects/${projectId}/daily-reports`, { params: filters });
        return response.data;
    },

    // Submit report for approval
    submitReport: async (id) => {
        const response = await api.post(`/daily-reports/${id}/submit`);
        return response.data;
    },

    // Approve report
    approveReport: async (id, approvalData) => {
        const response = await api.post(`/daily-reports/${id}/approve`, approvalData);
        return response.data;
    },

    // Reject report
    rejectReport: async (id, rejectionData) => {
        const response = await api.post(`/daily-reports/${id}/reject`, rejectionData);
        return response.data;
    },

    // Get report statistics
    getReportStatistics: async (filters = {}) => {
        const response = await api.get('/daily-reports/statistics', { params: filters });
        return response.data;
    },

    // Get pending reports for approval
    getPendingReports: async (filters = {}) => {
        const response = await api.get('/daily-reports/pending', { params: filters });
        return response.data;
    },

    // Get report history
    getReportHistory: async (id) => {
        const response = await api.get(`/daily-reports/${id}/history`);
        return response.data;
    },

    // Add task to report
    addTaskToReport: async (reportId, taskData) => {
        const response = await api.post(`/daily-reports/${reportId}/tasks`, taskData);
        return response.data;
    },

    // Update task in report
    updateTaskInReport: async (reportId, taskId, taskData) => {
        const response = await api.put(`/daily-reports/${reportId}/tasks/${taskId}`, taskData);
        return response.data;
    },

    // Remove task from report
    removeTaskFromReport: async (reportId, taskId) => {
        const response = await api.delete(`/daily-reports/${reportId}/tasks/${taskId}`);
        return response.data;
    },

    // Get report summary by date range
    getReportSummary: async (startDate, endDate, filters = {}) => {
        const response = await api.get('/daily-reports/summary', {
            params: {
                startDate,
                endDate,
                ...filters
            }
        });
        return response.data;
    },

    // Get user's report submission stats
    getUserReportStats: async (userId, timeRange = {}) => {
        const response = await api.get(`/users/${userId}/daily-reports/stats`, {
            params: timeRange
        });
        return response.data;
    },

    // Get team's report submission stats
    getTeamReportStats: async (teamId, timeRange = {}) => {
        const response = await api.get(`/teams/${teamId}/daily-reports/stats`, {
            params: timeRange
        });
        return response.data;
    }
}; 