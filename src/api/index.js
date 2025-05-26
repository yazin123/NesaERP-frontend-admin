//src/api/index.js
import axios from "axios";

class ApiHelper {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  getToken() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        this.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }

  async request(endpoint, options = {}) {
    this.getToken();
    
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Try token refresh on 401
          try {
            const refreshResult = await this.refreshToken();
            if (refreshResult?.newToken) {
              localStorage.setItem('authToken', refreshResult.newToken);
              this.headers["Authorization"] = `Bearer ${refreshResult.newToken}`;
              // Retry the original request
              const retryResponse = await fetch(url, {
                ...config,
                headers: this.headers,
              });
              const retryData = await retryResponse.json();
              if (retryResponse.ok) {
                return { data: retryData };
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
          // If refresh failed or retry failed, logout
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            window.location.href = '/';
          }
        }
        throw {
          status: response.status,
          message: data.message || 'An error occurred',
          response: { data }
        };
      }

      return { data };
    } catch (error) {
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Admin User Management
  async getCurrentAdmin() {
    try {
      const response = await this.get('/admin/users/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateAdminProfile(data) {
    try {
      const response = await this.put('/admin/users/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async changeAdminPassword(data) {
    try {
      const response = await this.put('/admin/users/change-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Admin Employee Management
  async getEmployees(filters = {}) {
    try {
      const response = await this.get('/admin/employees', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getEmployee(id) {
    try {
      const response = await this.get(`/admin/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createEmployee(data) {
    try {
      const response = await this.post('/admin/employees', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateEmployee(id, data) {
    try {
      const response = await this.put(`/admin/employees/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteEmployee(id) {
    try {
      const response = await this.delete(`/admin/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Admin Project Management
  async getProjects(filters = {}) {
    try {
      const response = await this.get('/admin/projects', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProject(id) {
    try {
      const response = await this.get(`/admin/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createProject(data) {
    try {
      const response = await this.post('/admin/projects', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateProject(id, data) {
    try {
      const response = await this.put(`/admin/projects/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteProject(id) {
    try {
      const response = await this.delete(`/admin/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Admin Task Management
  async getTasks(filters = {}) {
    try {
      const response = await this.get('/admin/tasks', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getTask(id) {
    try {
      const response = await this.get(`/admin/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createTask(data) {
    try {
      const response = await this.post('/admin/tasks', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateTask(id, data) {
    try {
      const response = await this.put(`/admin/tasks/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteTask(id) {
    try {
      const response = await this.delete(`/admin/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Admin Dashboard
  async getDashboardStats() {
    try {
      const response = await this.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProjectProgress() {
    try {
      const response = await this.get('/admin/dashboard/projects/progress');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getTeamWorkload() {
    try {
      const response = await this.get('/admin/dashboard/team/workload');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getRecentActivities() {
    try {
      const response = await this.get('/admin/dashboard/activities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Admin Settings
  async getSystemSettings() {
    try {
      const response = await this.get('/admin/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateSystemSettings(data) {
    try {
      const response = await this.put('/admin/settings', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    try {
      const response = await this.post('/admin/users/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async logout() {
    try {
      await this.post('/admin/users/logout');
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error('Logout error:', error);
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await this.post('/admin/users/refresh-token');
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }
}

const api = new ApiHelper();
export default api;