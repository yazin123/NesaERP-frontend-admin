//src/api/index.js
import axios from "axios";
class ApiHelper {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    this.headers = {
      "Content-Type": "application/json",
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

  get(endpoint, params) {
    this.getToken();
    return axios.get(`${this.baseUrl}${endpoint}`, {
      headers: this.headers,
      params,
    });
  }

  post(endpoint, data, customHeaders) {
    this.getToken();
    const headers = {
      ...this.headers,
      ...(data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}),
      ...customHeaders
    };
    delete headers['Content-Type'];  // Let browser set content-type for FormData
  
    return axios.post(`${this.baseUrl}${endpoint}`, data, { headers });
  }
  put(endpoint, data) {
    this.getToken();
    const headers = { ...this.headers };
    if (data instanceof FormData) {
      delete headers['Content-Type'];  // Let browser set content-type for FormData
    }
  
    return axios.put(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  delete(endpoint, params) {
    this.getToken();
    return axios.delete(`${this.baseUrl}${endpoint}`, {
      headers: this.headers,
      params,
    });
  }
}

export default new ApiHelper();