import axios from 'axios';
import CONFIG from '../config';

/**
 * Axios instance for Auth API
 * Points to the auth backend microservice
 */
export const authAxios = axios.create({
  baseURL: CONFIG.AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);
