// API Configuration for Astrotalk Mobile App

// Base URL for the API server
export const API_BASE_URL = __DEV__ 
  ? 'http://10.174.211.176:5000/api'  // Development
  : 'https://your-production-api.com/api';  // Production

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    VERIFY: '/auth/verify',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // User Management
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    WALLET: '/users/wallet',
    TRANSACTIONS: '/users/transactions',
  },
  
  // Astrologers
  ASTROLOGERS: {
    LIST: '/astrologers',
    DETAILS: '/astrologers/:id',
    AVAILABILITY: '/astrologers/:id/availability',
    REVIEWS: '/astrologers/:id/reviews',
  },
  
  // Chat & Messaging
  CHAT: {
    START_SESSION: '/chat/start',
    END_SESSION: '/chat/end',
    MESSAGES: '/chat/:sessionId/messages',
    SEND_MESSAGE: '/chat/:sessionId/messages',
    SESSIONS: '/chat/sessions',
  },
  
  // Wallet & Payments
  WALLET: {
    BALANCE: '/wallet/balance',
    ADD_CREDITS: '/wallet/add-credits',
    TRANSACTIONS: '/wallet/transactions',
    DEDUCT_CREDITS: '/wallet/deduct',
  },
  
  // Admin (for astrologer management)
  ADMIN: {
    ASTROLOGERS: '/admin/astrologers',
    SESSIONS: '/admin/sessions',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Request Timeout (in milliseconds)
export const REQUEST_TIMEOUT = 10000;

// Polling Configuration
export const POLLING_CONFIG = {
  CHAT_MESSAGES: 3000,  // Poll for new messages every 3 seconds
  WALLET_BALANCE: 30000, // Poll wallet balance every 30 seconds during chat
  ASTROLOGER_STATUS: 60000, // Poll astrologer availability every minute
};

// Credit Configuration
export const CREDIT_CONFIG = {
  MINIMUM_PURCHASE: 100,
  MAXIMUM_PURCHASE: 10000,
  CHAT_RATE_PER_MINUTE: 10, // Default rate, will be overridden by astrologer rates
};

// Storage Keys for AsyncStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@astrotalk_auth_token',
  REFRESH_TOKEN: '@astrotalk_refresh_token',
  USER_DATA: '@astrotalk_user_data',
  WALLET_BALANCE: '@astrotalk_wallet_balance',
  LAST_CHAT_SESSION: '@astrotalk_last_chat_session',
  APP_SETTINGS: '@astrotalk_app_settings',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  INSUFFICIENT_CREDITS: 'Insufficient credits. Please add credits to continue.',
  ASTROLOGER_UNAVAILABLE: 'Astrologer is currently unavailable.',
};
