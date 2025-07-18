import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import linkingService from '../../services/linkingService';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

const HomeScreen = () => {
  const {
    user,
    logout,
    networkError,
    isTokenRefreshing,
    refreshAuthToken,
    lastTokenRefresh
  } = useAuth();
  const [testLoading, setTestLoading] = useState(false);

  const handleTestApiCall = async () => {
    setTestLoading(true);
    try {
      const result = await authService.getProfile();
      if (result.success) {
        Alert.alert('API Test Success', `Profile loaded for ${result.data.user.name}`);
      } else {
        Alert.alert('API Test Failed', result.message);
      }
    } catch (error) {
      Alert.alert('API Test Error', error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleTokenRefresh = async () => {
    try {
      const result = await refreshAuthToken();
      if (result.success) {
        Alert.alert('Token Refresh Success', 'Token refreshed successfully');
      } else {
        Alert.alert('Token Refresh Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Token Refresh Error', error.message);
    }
  };

  const handleTestPasswordReset = async () => {
    try {
      const result = await authService.forgotPassword(user?.email || 'test@example.com');
      if (result.success) {
        Alert.alert('Password Reset Test', 'Password reset email sent! Check your email for the reset link.');
      } else {
        Alert.alert('Password Reset Test Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Password Reset Test Error', error.message);
    }
  };

  const handleTestDeepLink = () => {
    // Test password reset deep link
    const testToken = 'test-reset-token-' + Date.now();
    linkingService.testPasswordResetLink(testToken);
    Alert.alert('Deep Link Test', 'Test password reset link triggered. Check the console for details.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcome}>Welcome, {user?.name || 'User'}!</Text>
        <Text style={styles.subtitle}>Your cosmic journey begins here</Text>

        {networkError && (
          <View style={styles.networkWarning}>
            <Text style={styles.networkWarningText}>
              ⚠️ Network connection issues detected
            </Text>
          </View>
        )}
      </View>

      {/* User Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Wallet Balance:</Text>
          <Text style={styles.infoValue}>₹{user?.walletBalance || 0}</Text>
        </View>
        {lastTokenRefresh && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Last Token Refresh:</Text>
            <Text style={styles.infoValue}>
              {new Date(lastTokenRefresh).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Test Section */}
      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>Authentication Tests</Text>

        <TouchableOpacity
          style={[styles.testButton, testLoading && styles.buttonDisabled]}
          onPress={handleTestApiCall}
          disabled={testLoading}
        >
          {testLoading ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <Text style={styles.buttonText}>Test API Call</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, isTokenRefreshing && styles.buttonDisabled]}
          onPress={handleTokenRefresh}
          disabled={isTokenRefreshing}
        >
          {isTokenRefreshing ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <Text style={styles.buttonText}>Refresh Token</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestPasswordReset}
        >
          <Text style={styles.buttonText}>Test Password Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestDeepLink}
        >
          <Text style={styles.buttonText}>Test Deep Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.buttonText}>My Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  welcome: {
    fontSize: FONTS.xxl,
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  networkWarning: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  networkWarningText: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: SPACING.xl,
  },
  testSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
  infoValue: {
    fontSize: FONTS.md,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    flex: 1,
    textAlign: 'right',
  },
  testButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoutButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
  },
  logoutText: {
    color: COLORS.text,
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default HomeScreen;
