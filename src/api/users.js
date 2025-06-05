import api from './config';

export const usersApi = {
  // User management
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getManagers: () => api.get('/admin/users/managers'),
  getUserById: (id) => api.get(`/admin/users/${id}`),

  createUser: (data) => {
    const formData = new FormData();
    
    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      return api.post(`/admin/users`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    // Convert data to FormData
    Object.keys(data).forEach(key => {
      if (key === 'photo' || key === 'resume') {
        if (data[key]) formData.append(key, data[key]);
      } else if (key === 'bankDetails') {
        // Handle bankDetails specifically
        const bankDetails = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
        formData.append(key, bankDetails);
      } else if (Array.isArray(data[key])) {
        // Handle arrays (skills, allowedWifiNetworks, etc.)
        formData.append(key, JSON.stringify(data[key]));
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    return api.post(`/admin/users`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateUser: (id, data) => {
    const formData = new FormData();
    
    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      return api.put(`/admin/users/update/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    // Convert data to FormData
    Object.keys(data).forEach(key => {
      if (key === 'photo' || key === 'resume') {
        if (data[key]) formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    return api.put(`/admin/users/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Employee-specific endpoints (aliases for backward compatibility)
  getEmployees: (params) => api.get('/admin/users', { params: { ...params, type: 'employee' } }),
  getEmployeeById: (id) => api.get(`/admin/users/${id}`),
  createEmployee: (data) => usersApi.createUser({ ...data, type: 'employee' }),
  updateEmployee: (id, data) => usersApi.updateUser(id, { ...data, type: 'employee' }),
  deleteEmployee: (id) => usersApi.deleteUser(id),

  // User performance
  getUserPerformance: (userId) => api.get(`/admin/users/${userId}/performance`),
  updatePerformance: (userId, data) => api.put(`/admin/users/${userId}/performance`, data),
};

export default usersApi; 