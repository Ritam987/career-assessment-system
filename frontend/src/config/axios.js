/**
 * ============================================================================
 * AXIOS CONFIGURATION (axios.js)
 * ============================================================================
 * Purpose: Centralized axios instance with pre-configured settings for
 * all API calls. This ensures consistent baseURL, credentials, and headers
 * across all service files.
 * ============================================================================
 */

import axios from 'axios';
import { apiUrl } from './api';

const axiosInstance = axios.create({
  baseURL: apiUrl('/api'),
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      const path = window.location.pathname;
      const onAuthPage = path === '/login' || path === '/register' || path === '/admin';
      if (!onAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
