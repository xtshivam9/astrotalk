import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌟</Text>
          <Text style={styles.appName}>Astrotalk</Text>
        </View>
        
        {/* Loading Indicator */}
        <ActivityIndicator 
          size="large" 
          color={COLORS.accent} 
          style={styles.loader}
        />
        
        {/* Loading Text */}
        <Text style={styles.loadingText}>
          Connecting to the stars...
        </Text>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your cosmic journey awaits
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoText: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONTS.xxxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  loader: {
    marginVertical: SPACING.xl,
  },
  loadingText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  footer: {
    paddingBottom: SPACING.xl,
  },
  footerText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.light,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default LoadingScreen;
