import api from './config';

export const calendarApi = {
    // Event management
    getEvents: (params) => api.get('/calendar/events', { params }),
    getEventById: (id) => api.get(`/calendar/events/${id}`),
    createEvent: (data) => api.post('/calendar/events', data),
    updateEvent: (id, data) => api.put(`/calendar/events/${id}`, data),
    deleteEvent: (id) => api.delete(`/calendar/events/${id}`),

    // Calendar settings
    getSettings: () => api.get('/calendar/settings'),
    updateSettings: (data) => api.put('/calendar/settings', data),

    // Event categories
    getCategories: () => api.get('/calendar/categories'),
    createCategory: (data) => api.post('/calendar/categories', data),
    updateCategory: (id, data) => api.put(`/calendar/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/calendar/categories/${id}`),

    // Event reminders
    getReminders: () => api.get('/calendar/reminders'),
    createReminder: (data) => api.post('/calendar/reminders', data),
    updateReminder: (id, data) => api.put(`/calendar/reminders/${id}`, data),
    deleteReminder: (id) => api.delete(`/calendar/reminders/${id}`)
};

export default calendarApi; 