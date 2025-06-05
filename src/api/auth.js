import api from './config';

const authApi = {
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },
  logout: async () => {
    const response = await api.post('/users/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return response;
  },
  getCurrentUser: () => api.get('/users/me'),
  getUserWithRole: () => api.get('/users/me/role'),
  changePassword: (data) => api.put('/users/password', data),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePhoto: (formData) => {
    return api.put('/users/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await api.post('/users/refresh-token', { refreshToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  forgotPassword: (email) => api.post('/users/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/users/reset-password', { token, password }),
};

export default authApi;