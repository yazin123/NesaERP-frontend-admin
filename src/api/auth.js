import api from './config';

export const authApi = {
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/current'),
  getUserWithRole: () => api.get('/users/me/role'),
  changePassword: (data) => api.put('/users/profile/password', data),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePhoto: (formData) => {
    return api.put('/users/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default authApi; 