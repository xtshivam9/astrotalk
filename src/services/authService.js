import apiService from './api';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants/api';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, {
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
        password: userData.password,
        confirmPassword: userData.confirmPassword
      });

      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.SERVER_ERROR,
        errors: error.data?.errors || []
      };
    }
  }

  // Login user
  async login(identifier, password) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, {
        identifier,
        password
      });

      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      if (error.status === 401) {
        return {
          success: false,
          message: 'Invalid email/phone or password'
        };
      }

      return {
        success: false,
        message: error.message || ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      // Even if logout fails on server, we should clear local data
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await apiService.get(API_ENDPOINTS.AUTH.PROFILE);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.SERVER_ERROR,
        errors: error.data?.errors || []
      };
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiService.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.SERVER_ERROR,
        errors: error.data?.errors || []
      };
    }
  }

  // Forgot password
  async forgotPassword(identifier) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        identifier
      });

      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  // Reset password
  async resetPassword(token, password, confirmPassword) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password,
        confirmPassword
      });

      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.SERVER_ERROR,
        errors: error.data?.errors || []
      };
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await apiService.get(API_ENDPOINTS.AUTH.VERIFY);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.UNAUTHORIZED
      };
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refreshToken
      });

      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.UNAUTHORIZED
      };
    }
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone format
  validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
  }

  // Validate password strength
  validatePassword(password) {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (password.length > 128) {
        errors.push('Password cannot exceed 128 characters');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate name
  validateName(name) {
    const errors = [];
    
    if (!name || !name.trim()) {
      errors.push('Name is required');
    } else {
      if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      if (name.trim().length > 50) {
        errors.push('Name cannot exceed 50 characters');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Comprehensive form validation
  validateRegistrationForm(formData) {
    const errors = {};
    
    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!this.validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate phone
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!this.validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Validate name
    const nameValidation = this.validateName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errors[0];
    }
    
    // Validate password
    const passwordValidation = this.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
    
    // Validate password confirmation
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate login form
  validateLoginForm(formData) {
    const errors = {};
    
    // Validate identifier (email or phone)
    if (!formData.identifier) {
      errors.identifier = 'Email or phone number is required';
    } else {
      const isEmail = this.validateEmail(formData.identifier);
      const isPhone = this.validatePhone(formData.identifier);
      
      if (!isEmail && !isPhone) {
        errors.identifier = 'Please enter a valid email address or phone number';
      }
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
