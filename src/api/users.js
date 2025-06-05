import api from './config';

const usersApi = {
  // User management
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photo' || key === 'resume') {
        if (data[key]) formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/admin/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateUser: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photo' || key === 'resume') {
        if (data[key]) formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/admin/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Employee-specific endpoints
  getEmployees: (params) => api.get('/admin/users', { params: { ...params, type: 'employee' } }),
  getEmployeeById: (id) => api.get(`/admin/users/${id}`),
  createEmployee: (data) => usersApi.createUser({ ...data, type: 'employee' }),
  updateEmployee: (id, data) => usersApi.updateUser(id, { ...data, type: 'employee' }),
  deleteEmployee: (id) => usersApi.deleteUser(id),

  // User performance
  getUserPerformance: (userId) => api.get(`/admin/users/${userId}/performance`),
  updatePerformance: (userId, data) => api.put(`/admin/users/${userId}/performance`, data),

  // Profile management
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photo') {
        if (data[key]) formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Password management
  changePassword: (data) => api.put('/users/profile/password', data)
};

export default usersApi; 