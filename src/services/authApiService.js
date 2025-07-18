import apiService from './api';
import { useAuth } from '../context/AuthContext';

// Higher-order function that wraps API calls with authentication retry logic
export const createAuthenticatedApiCall = (authContext) => {
  const { retryWithAuth } = authContext;

  return {
    // Authenticated GET request
    get: async (url, config = {}) => {
      return retryWithAuth(() => apiService.get(url, config));
    },

    // Authenticated POST request
    post: async (url, data, config = {}) => {
      return retryWithAuth(() => apiService.post(url, data, config));
    },

    // Authenticated PUT request
    put: async (url, data, config = {}) => {
      return retryWithAuth(() => apiService.put(url, data, config));
    },

    // Authenticated DELETE request
    delete: async (url, config = {}) => {
      return retryWithAuth(() => apiService.delete(url, config));
    },

    // Authenticated PATCH request
    patch: async (url, data, config = {}) => {
      return retryWithAuth(() => apiService.patch(url, data, config));
    },
  };
};

// Hook to get authenticated API service
export const useAuthenticatedApi = () => {
  const authContext = useAuth();
  return createAuthenticatedApiCall(authContext);
};

// Direct authenticated API calls (for use outside of React components)
class AuthenticatedApiService {
  constructor() {
    this.authContext = null;
  }

  setAuthContext(authContext) {
    this.authContext = authContext;
  }

  async get(url, config = {}) {
    if (!this.authContext) {
      throw new Error('Auth context not set');
    }
    return this.authContext.retryWithAuth(() => apiService.get(url, config));
  }

  async post(url, data, config = {}) {
    if (!this.authContext) {
      throw new Error('Auth context not set');
    }
    return this.authContext.retryWithAuth(() => apiService.post(url, data, config));
  }

  async put(url, data, config = {}) {
    if (!this.authContext) {
      throw new Error('Auth context not set');
    }
    return this.authContext.retryWithAuth(() => apiService.put(url, data, config));
  }

  async delete(url, config = {}) {
    if (!this.authContext) {
      throw new Error('Auth context not set');
    }
    return this.authContext.retryWithAuth(() => apiService.delete(url, config));
  }

  async patch(url, data, config = {}) {
    if (!this.authContext) {
      throw new Error('Auth context not set');
    }
    return this.authContext.retryWithAuth(() => apiService.patch(url, data, config));
  }
}

// Singleton instance for use outside React components
export const authenticatedApiService = new AuthenticatedApiService();

export default authenticatedApiService;
