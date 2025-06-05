import axios from "axios";
import { setupCache } from 'axios-cache-interceptor';

// Create and export the base API instance
export const api = setupCache(
  axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    },
    // Retry configuration
    retry: {
      retries: 3,
      retryCondition: (error) => {
        return axios.isRetryableError(error) && error.response?.status !== 401;
      },
      retryDelay: (retryCount) => retryCount * 1000, // Progressive delay
    }
  })
);

// Request queue for offline support
let requestQueue = [];
const isOnline = () => typeof window !== 'undefined' && window.navigator.onLine;

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!config.url.includes('/login')) {
      // If no token and not a login request, reject immediately
      return Promise.reject(new Error('No authentication token'));
    }

    // Handle FormData requests
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    // Queue requests if offline
    if (!isOnline() && config.method !== 'get') {
      requestQueue.push(config);
      throw new Error('Offline - Request queued');
    }

    // Log request
    console.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 
      config.method !== 'get' ? config.data : '');

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response
    console.debug(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, 
      response.data);
    return response;
  },
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403 || error.message === 'No authentication token') {
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already there and not a login request
      if (window.location.pathname !== '/' && !error.config?.url?.includes('/login')) {
        // Use replace to prevent back navigation to protected routes
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);

// Process queued requests when back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    const queue = [...requestQueue];
    requestQueue = [];
    for (const config of queue) {
      try {
        await api(config);
      } catch (error) {
        console.error('Failed to process queued request:', error);
      }
    }
  });
}

export default api; 