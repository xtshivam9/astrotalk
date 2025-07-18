// Astrotalk App Theme Configuration
export const COLORS = {
  // Primary Colors - Astrological Theme
  primary: '#1a1a2e',        // Deep space blue
  secondary: '#16213e',      // Darker blue
  accent: '#e94560',         // Cosmic red
  gold: '#ffd700',           // Golden stars
  purple: '#6c5ce7',         // Mystical purple
  
  // Background Colors
  background: '#0f0f23',     // Dark space background
  surface: '#1e1e3f',        // Card/surface background
  overlay: 'rgba(0,0,0,0.7)', // Modal overlay
  
  // Text Colors
  text: '#ffffff',           // Primary text
  textSecondary: '#b8b8d1',  // Secondary text
  textMuted: '#8e8ea0',      // Muted text
  
  // Status Colors
  success: '#00b894',        // Success green
  warning: '#fdcb6e',        // Warning yellow
  error: '#e17055',          // Error red
  info: '#74b9ff',           // Info blue
  
  // UI Colors
  border: '#2d2d54',         // Border color
  divider: '#3a3a5c',        // Divider color
  shadow: 'rgba(0,0,0,0.3)', // Shadow color
  
  // Gradient Colors
  gradientStart: '#1a1a2e',
  gradientEnd: '#16213e',
  accentGradientStart: '#e94560',
  accentGradientEnd: '#ff6b8a',
};

export const FONTS = {
  // Font Families
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
  
  // Font Sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Line Heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 48,
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const LAYOUT = {
  window: {
    width: '100%',
    height: '100%',
  },
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  header: {
    height: 60,
    paddingHorizontal: SPACING.md,
  },
  tabBar: {
    height: 60,
  },
};
