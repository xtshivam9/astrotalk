import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/api';
import authService from '../services/authService';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  loading: true,
  error: null,
  networkError: false,
  isTokenRefreshing: false,
  lastTokenRefresh: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  TOKEN_REFRESH_SUCCESS: 'TOKEN_REFRESH_SUCCESS',
  SET_NETWORK_ERROR: 'SET_NETWORK_ERROR',
  CLEAR_NETWORK_ERROR: 'CLEAR_NETWORK_ERROR',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
        networkError: false,
        lastTokenRefresh: new Date().toISOString(),
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.TOKEN_REFRESH_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user || state.user,
        isTokenRefreshing: false,
        error: null,
        networkError: false,
        lastTokenRefresh: new Date().toISOString(),
      };

    case AUTH_ACTIONS.SET_NETWORK_ERROR:
      return {
        ...state,
        networkError: true,
        loading: false,
      };

    case AUTH_ACTIONS.CLEAR_NETWORK_ERROR:
      return {
        ...state,
        networkError: false,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored authentication data on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const [token, userData, refreshToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);

        // Verify token with backend
        const verifyResult = await authService.verifyToken();

        if (verifyResult.success) {
          // Token is valid, proceed with login
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token, refreshToken },
          });
        } else {
          // Token is invalid, try to refresh if refresh token exists
          if (refreshToken) {
            const refreshResult = await attemptTokenRefresh(refreshToken);
            if (!refreshResult.success) {
              // Refresh failed, clear storage and logout
              await clearAuthStorage();
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          } else {
            // No refresh token, clear storage and logout
            await clearAuthStorage();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        }
      } else {
        // No stored credentials
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);

      // Check if it's a network error
      if (error.message?.includes('Network') || error.status === 0) {
        // Network error - keep user logged in locally but show network error
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token, refreshToken: null },
          });
          dispatch({ type: AUTH_ACTIONS.SET_NETWORK_ERROR });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        // Other errors - logout
        await clearAuthStorage();
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    }
  };

  // Helper function to clear auth storage
  const clearAuthStorage = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.WALLET_BALANCE,
        STORAGE_KEYS.LAST_CHAT_SESSION,
      ]);
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  };

  // Token refresh function
  const attemptTokenRefresh = async (refreshToken) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const refreshResult = await authService.refreshToken(refreshToken);

      if (refreshResult.success) {
        const { user, token, refreshToken: newRefreshToken } = refreshResult.data;

        // Store new tokens
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        if (newRefreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        dispatch({
          type: AUTH_ACTIONS.TOKEN_REFRESH_SUCCESS,
          payload: { user, token, refreshToken: newRefreshToken },
        });

        return { success: true };
      } else {
        return { success: false, message: refreshResult.message };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, message: error.message };
    }
  };

  const login = async (userData, token, refreshToken = null) => {
    try {
      // Store authentication data
      const storagePromises = [
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
      ];

      if (refreshToken) {
        storagePromises.push(AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken));
      }

      await Promise.all(storagePromises);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: userData, token, refreshToken },
      });

      // Clear any network errors on successful login
      dispatch({ type: AUTH_ACTIONS.CLEAR_NETWORK_ERROR });
    } catch (error) {
      console.error('Error storing auth data:', error);
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: 'Failed to save authentication data',
      });
    }
  };

  const logout = async (showNetworkError = false) => {
    try {
      // Call logout API if we have a token and network is available
      if (state.token && !showNetworkError) {
        try {
          await authService.logout();
        } catch (error) {
          console.log('Logout API call failed, proceeding with local logout');
        }
      }

      // Clear stored authentication data
      await clearAuthStorage();

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still logout even if storage clear fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const updateUser = async (userData) => {
    try {
      // Update user data in storage
      const updatedUser = { ...state.user, ...userData };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData,
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      // Still update in memory even if storage fails
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData,
      });
    }
  };

  const setError = (error) => {
    dispatch({
      type: AUTH_ACTIONS.SET_ERROR,
      payload: error,
    });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const setLoading = (loading) => {
    dispatch({
      type: AUTH_ACTIONS.SET_LOADING,
      payload: loading,
    });
  };

  // Force token refresh
  const refreshAuthToken = async () => {
    if (state.isTokenRefreshing) {
      return { success: false, message: 'Token refresh already in progress' };
    }

    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      return { success: false, message: 'No refresh token available' };
    }

    return await attemptTokenRefresh(refreshToken);
  };

  // Check if token needs refresh (call this before API requests)
  const shouldRefreshToken = () => {
    if (!state.lastTokenRefresh) return false;

    const lastRefresh = new Date(state.lastTokenRefresh);
    const now = new Date();
    const timeDiff = now.getTime() - lastRefresh.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    // Refresh if token is older than 23 hours (tokens expire in 24 hours)
    return hoursDiff > 23;
  };

  // Retry network operations
  const retryWithAuth = async (apiCall, maxRetries = 1) => {
    try {
      // Check if token needs refresh before making the call
      if (shouldRefreshToken()) {
        await refreshAuthToken();
      }

      const result = await apiCall();

      // Clear network error on successful call
      if (state.networkError) {
        dispatch({ type: AUTH_ACTIONS.CLEAR_NETWORK_ERROR });
      }

      return result;
    } catch (error) {
      // If unauthorized and we have retries left, try to refresh token
      if (error.status === 401 && maxRetries > 0) {
        const refreshResult = await refreshAuthToken();
        if (refreshResult.success) {
          return await retryWithAuth(apiCall, maxRetries - 1);
        } else {
          // Refresh failed, logout user
          await logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      // Handle network errors
      if (error.status === 0 || error.message?.includes('Network')) {
        dispatch({ type: AUTH_ACTIONS.SET_NETWORK_ERROR });
      }

      throw error;
    }
  };

  // Clear network error manually
  const clearNetworkError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_NETWORK_ERROR });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    setError,
    clearError,
    setLoading,
    refreshAuthToken,
    shouldRefreshToken,
    retryWithAuth,
    clearNetworkError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
