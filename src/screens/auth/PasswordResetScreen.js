import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import linkingService from '../../services/linkingService';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

const PasswordResetScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    // Check if token was passed via navigation params
    const token = route?.params?.token;
    if (token) {
      setResetToken(token);
      validateToken(token);
      return;
    }

    // Check for pending password reset link
    const pendingLink = linkingService.getPendingLink('password-reset');
    if (pendingLink?.token) {
      setResetToken(pendingLink.token);
      validateToken(pendingLink.token);
      return;
    }

    // Listen for password reset deep links
    const unsubscribe = linkingService.addListener('password-reset', (data) => {
      if (data.token) {
        setResetToken(data.token);
        validateToken(data.token);
      }
    });

    // If no token found, show error
    setTimeout(() => {
      if (!resetToken) {
        setValidatingToken(false);
        Alert.alert(
          'Invalid Link',
          'No reset token found. Please use the link from your email.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    }, 2000);

    return unsubscribe;
  }, [route?.params?.token]);

  const validateToken = async (token) => {
    try {
      setValidatingToken(true);
      
      // For now, we'll assume the token is valid if it exists
      // In a real implementation, you might want to validate with the backend
      if (token && token.length > 10) {
        setTokenValidated(true);
      } else {
        throw new Error('Invalid token format');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      Alert.alert(
        'Invalid Token',
        'The reset token is invalid or has expired. Please request a new password reset.',
        [{ text: 'OK', onPress: () => navigation.navigate('ForgotPassword') }]
      );
    } finally {
      setValidatingToken(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate password
    const passwordValidation = authService.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }
    
    // Validate password confirmation
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordReset = async () => {
    if (!validateForm()) {
      return;
    }

    if (!resetToken) {
      Alert.alert('Error', 'Reset token is missing. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.resetPassword(
        resetToken,
        formData.password,
        formData.confirmPassword
      );
      
      if (result.success) {
        // Auto-login after successful password reset
        if (result.data?.user && result.data?.token) {
          await login(result.data.user, result.data.token);
        }
        
        Alert.alert(
          'Password Reset Successful',
          'Your password has been reset successfully. You are now logged in.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        if (result.errors && result.errors.length > 0) {
          Alert.alert('Password Reset Failed', result.errors.join('\n'));
        } else {
          Alert.alert('Password Reset Failed', result.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Validating reset token...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tokenValidated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Invalid Reset Link</Text>
          <Text style={styles.errorMessage}>
            The password reset link is invalid or has expired.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.retryButtonText}>Request New Reset Link</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoText}>🔐</Text>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Enter your new password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your new password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, loading && styles.resetButtonDisabled]}
              onPress={handlePasswordReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <Text style={styles.resetButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Remember your password?{' '}
              <Text
                style={styles.signInText}
                onPress={() => navigation.navigate('Login')}
              >
                Sign In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    fontSize: FONTS.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONTS.lineHeight.md,
    marginBottom: SPACING.xxl,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  logoText: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingTop: SPACING.xl,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  resetButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  footerText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  signInText: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },
});

export default PasswordResetScreen;
