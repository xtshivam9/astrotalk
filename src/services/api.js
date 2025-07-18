import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS, REQUEST_TIMEOUT, HTTP_STATUS } from '../constants/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Don't handle auth errors here - let the AuthContext handle them
    // This allows for proper token refresh logic
    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  // Generic request method
  async request(method, url, data = null, config = {}) {
    try {
      const response = await apiClient({
        method,
        url,
        data,
        ...config,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // GET request
  async get(url, config = {}) {
    return this.request('GET', url, null, config);
  }

  // POST request
  async post(url, data, config = {}) {
    return this.request('POST', url, data, config);
  }

  // PUT request
  async put(url, data, config = {}) {
    return this.request('PUT', url, data, config);
  }

  // DELETE request
  async delete(url, config = {}) {
    return this.request('DELETE', url, null, config);
  }

  // PATCH request
  async patch(url, data, config = {}) {
    return this.request('PATCH', url, data, config);
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data.message || 'Server error occurred',
        data: data,
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        message: 'Network error. Please check your internet connection.',
        data: null,
      };
    } else {
      // Other error
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
        data: null,
      };
    }
  }

  // Helper method to build URL with parameters
  buildUrl(endpoint, params = {}) {
    let url = endpoint;
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    return url;
  }

  // Upload file method (for future use)
  async uploadFile(url, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    return this.request('POST', url, formData, config);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export specific methods for convenience
export const { get, post, put, delete: del, patch } = apiService;
