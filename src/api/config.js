import axios from "axios";
import { setupCache } from 'axios-cache-interceptor';

// Create and export the base API instance
export const api = setupCache(
  axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
);

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData requests
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 