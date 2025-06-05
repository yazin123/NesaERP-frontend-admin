import api from './api';

export const taskService = {
    // Get all tasks
    getAllTasks: async (filters = {}) => {
        const response = await api.get('/tasks', { params: filters });
        return response.data;
    },

    // Get task by ID
    getTaskById: async (id) => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    // Create new task
    createTask: async (taskData) => {
        const response = await api.post('/tasks', taskData);
        return response.data;
    },

    // Update task
    updateTask: async (id, taskData) => {
        const response = await api.put(`/tasks/${id}`, taskData);
        return response.data;
    },

    // Delete task
    deleteTask: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    },

    // Update task status
    updateTaskStatus: async (id, status) => {
        const response = await api.patch(`/tasks/${id}/status`, { status });
        return response.data;
    },

    // Add task comment
    addTaskComment: async (taskId, comment) => {
        const response = await api.post(`/tasks/${taskId}/comments`, comment);
        return response.data;
    },

    // Get task comments
    getTaskComments: async (taskId) => {
        const response = await api.get(`/tasks/${taskId}/comments`);
        return response.data;
    },

    // Delete task comment
    deleteTaskComment: async (taskId, commentId) => {
        const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
        return response.data;
    },

    // Upload task attachment
    uploadTaskAttachment: async (taskId, formData) => {
        const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Get task attachments
    getTaskAttachments: async (taskId) => {
        const response = await api.get(`/tasks/${taskId}/attachments`);
        return response.data;
    },

    // Delete task attachment
    deleteTaskAttachment: async (taskId, attachmentId) => {
        const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
        return response.data;
    },

    // Get task history
    getTaskHistory: async (taskId) => {
        const response = await api.get(`/tasks/${taskId}/history`);
        return response.data;
    },

    // Add task dependency
    addTaskDependency: async (taskId, dependencyData) => {
        const response = await api.post(`/tasks/${taskId}/dependencies`, dependencyData);
        return response.data;
    },

    // Remove task dependency
    removeTaskDependency: async (taskId, dependencyId) => {
        const response = await api.delete(`/tasks/${taskId}/dependencies/${dependencyId}`);
        return response.data;
    },

    // Get task dependencies
    getTaskDependencies: async (taskId) => {
        const response = await api.get(`/tasks/${taskId}/dependencies`);
        return response.data;
    },

    // Update task progress
    updateTaskProgress: async (taskId, progress) => {
        const response = await api.patch(`/tasks/${taskId}/progress`, { progress });
        return response.data;
    },

    // Get tasks by assignee
    getTasksByAssignee: async (userId, filters = {}) => {
        const response = await api.get(`/users/${userId}/tasks`, { params: filters });
        return response.data;
    },

    // Get task statistics
    getTaskStatistics: async (filters = {}) => {
        const response = await api.get('/tasks/statistics', { params: filters });
        return response.data;
    },

    // Add subtask
    addSubtask: async (taskId, subtaskData) => {
        const response = await api.post(`/tasks/${taskId}/subtasks`, subtaskData);
        return response.data;
    },

    // Update subtask
    updateSubtask: async (taskId, subtaskId, subtaskData) => {
        const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, subtaskData);
        return response.data;
    },

    // Delete subtask
    deleteSubtask: async (taskId, subtaskId) => {
        const response = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
        return response.data;
    }
}; 