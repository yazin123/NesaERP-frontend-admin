import api from './api';

export const performanceService = {
    // Get user performance
    getUserPerformance: async (userId, timeRange = {}) => {
        const response = await api.get(`/users/${userId}/performance`, {
            params: timeRange
        });
        return response.data;
    },

    // Get team performance
    getTeamPerformance: async (teamId, timeRange = {}) => {
        const response = await api.get(`/teams/${teamId}/performance`, {
            params: timeRange
        });
        return response.data;
    },

    // Get project performance
    getProjectPerformance: async (projectId, timeRange = {}) => {
        const response = await api.get(`/projects/${projectId}/performance`, {
            params: timeRange
        });
        return response.data;
    },

    // Create performance record
    createPerformanceRecord: async (performanceData) => {
        const response = await api.post('/performance', performanceData);
        return response.data;
    },

    // Update performance record
    updatePerformanceRecord: async (id, performanceData) => {
        const response = await api.put(`/performance/${id}`, performanceData);
        return response.data;
    },

    // Delete performance record
    deletePerformanceRecord: async (id) => {
        const response = await api.delete(`/performance/${id}`);
        return response.data;
    },

    // Get performance metrics
    getPerformanceMetrics: async (filters = {}) => {
        const response = await api.get('/performance/metrics', { params: filters });
        return response.data;
    },

    // Get performance trends
    getPerformanceTrends: async (timeRange = {}) => {
        const response = await api.get('/performance/trends', {
            params: timeRange
        });
        return response.data;
    },

    // Add performance feedback
    addPerformanceFeedback: async (userId, feedbackData) => {
        const response = await api.post(`/users/${userId}/performance/feedback`, feedbackData);
        return response.data;
    },

    // Get performance feedback
    getPerformanceFeedback: async (userId, filters = {}) => {
        const response = await api.get(`/users/${userId}/performance/feedback`, {
            params: filters
        });
        return response.data;
    },

    // Get attendance records
    getAttendanceRecords: async (userId, timeRange = {}) => {
        const response = await api.get(`/users/${userId}/attendance`, {
            params: timeRange
        });
        return response.data;
    },

    // Get task completion metrics
    getTaskCompletionMetrics: async (userId, timeRange = {}) => {
        const response = await api.get(`/users/${userId}/performance/tasks`, {
            params: timeRange
        });
        return response.data;
    },

    // Get productivity metrics
    getProductivityMetrics: async (userId, timeRange = {}) => {
        const response = await api.get(`/users/${userId}/performance/productivity`, {
            params: timeRange
        });
        return response.data;
    },

    // Get performance rankings
    getPerformanceRankings: async (filters = {}) => {
        const response = await api.get('/performance/rankings', {
            params: filters
        });
        return response.data;
    },

    // Get performance summary
    getPerformanceSummary: async (userId, timeRange = {}) => {
        const response = await api.get(`/users/${userId}/performance/summary`, {
            params: timeRange
        });
        return response.data;
    },

    // Get performance goals
    getPerformanceGoals: async (userId) => {
        const response = await api.get(`/users/${userId}/performance/goals`);
        return response.data;
    },

    // Set performance goals
    setPerformanceGoals: async (userId, goalsData) => {
        const response = await api.post(`/users/${userId}/performance/goals`, goalsData);
        return response.data;
    },

    // Update performance goals
    updatePerformanceGoals: async (userId, goalId, goalData) => {
        const response = await api.put(`/users/${userId}/performance/goals/${goalId}`, goalData);
        return response.data;
    },

    // Get performance reports
    getPerformanceReports: async (filters = {}) => {
        const response = await api.get('/performance/reports', {
            params: filters
        });
        return response.data;
    },

    // Generate performance report
    generatePerformanceReport: async (reportConfig) => {
        const response = await api.post('/performance/reports/generate', reportConfig);
        return response.data;
    }
}; 