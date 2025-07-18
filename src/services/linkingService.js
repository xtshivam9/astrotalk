import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

class LinkingService {
  constructor() {
    this.listeners = new Map();
    this.isInitialized = false;
  }

  // Initialize the linking service
  initialize() {
    if (this.isInitialized) return;

    // Handle initial URL when app is opened from a link
    this.handleInitialURL();

    // Listen for incoming links when app is already open
    this.linkingSubscription = Linking.addEventListener('url', this.handleDeepLink.bind(this));

    this.isInitialized = true;
    console.log('🔗 Linking service initialized');
  }

  // Clean up listeners
  cleanup() {
    if (this.linkingSubscription) {
      this.linkingSubscription.remove();
    }
    this.listeners.clear();
    this.isInitialized = false;
  }

  // Handle initial URL when app is launched from a link
  async handleInitialURL() {
    try {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        console.log('Initial URL:', initialURL);
        this.handleDeepLink({ url: initialURL });
      }
    } catch (error) {
      console.error('Error handling initial URL:', error);
    }
  }

  // Handle incoming deep links
  handleDeepLink(event) {
    try {
      const { url } = event;
      console.log('Deep link received:', url);

      const parsedURL = Linking.parse(url);
      console.log('Parsed URL:', parsedURL);

      // Route based on the path
      switch (parsedURL.path) {
        case 'reset-password':
          this.handlePasswordReset(parsedURL.queryParams);
          break;
        case 'verify-email':
          this.handleEmailVerification(parsedURL.queryParams);
          break;
        case 'chat':
          this.handleChatLink(parsedURL.queryParams);
          break;
        default:
          console.log('Unknown deep link path:', parsedURL.path);
          this.notifyListeners('unknown', parsedURL);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      Alert.alert('Link Error', 'Unable to process the link. Please try again.');
    }
  }

  // Handle password reset deep links
  handlePasswordReset(queryParams) {
    const { token } = queryParams;
    
    if (!token) {
      Alert.alert(
        'Invalid Link',
        'The password reset link is invalid or missing required information.'
      );
      return;
    }

    console.log('Password reset token received:', token);
    
    // Notify listeners about password reset
    this.notifyListeners('password-reset', { token });
  }

  // Handle email verification deep links
  handleEmailVerification(queryParams) {
    const { token, email } = queryParams;
    
    if (!token) {
      Alert.alert(
        'Invalid Link',
        'The email verification link is invalid or missing required information.'
      );
      return;
    }

    console.log('Email verification token received:', token);
    
    // Notify listeners about email verification
    this.notifyListeners('email-verification', { token, email });
  }

  // Handle chat deep links (for future use)
  handleChatLink(queryParams) {
    const { astrologerId, sessionId } = queryParams;
    
    console.log('Chat link received:', { astrologerId, sessionId });
    
    // Notify listeners about chat link
    this.notifyListeners('chat', { astrologerId, sessionId });
  }

  // Register a listener for specific link types
  addListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Remove a specific listener
  removeListener(type, callback) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners of a specific type
  notifyListeners(type, data) {
    const callbacks = this.listeners.get(type);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${type} listener:`, error);
        }
      });
    } else {
      console.log(`No listeners registered for type: ${type}`);
      
      // Store the data for later if no listeners are registered yet
      this.pendingLinks = this.pendingLinks || new Map();
      this.pendingLinks.set(type, data);
    }
  }

  // Get pending links (useful for components that register listeners after the link was received)
  getPendingLink(type) {
    if (this.pendingLinks && this.pendingLinks.has(type)) {
      const data = this.pendingLinks.get(type);
      this.pendingLinks.delete(type);
      return data;
    }
    return null;
  }

  // Create deep links (for sharing or testing)
  createDeepLink(path, params = {}) {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `astrotalk://${path}${queryString ? `?${queryString}` : ''}`;
    return url;
  }

  // Open external URLs
  async openURL(url) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open the link');
    }
  }

  // Test deep link functionality (for development)
  async testPasswordResetLink(token) {
    const url = this.createDeepLink('reset-password', { token });
    console.log('Test password reset link:', url);
    
    // Simulate receiving the link
    this.handleDeepLink({ url });
  }

  // Get app URL scheme
  getScheme() {
    return 'astrotalk';
  }

  // Check if a URL belongs to this app
  isAppURL(url) {
    return url.startsWith('astrotalk://');
  }
}

// Create and export singleton instance
const linkingService = new LinkingService();
export default linkingService;

// Export hook for React components
export const useLinking = () => {
  return linkingService;
};
