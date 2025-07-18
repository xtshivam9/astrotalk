import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const NetworkStatusBanner = () => {
  const { networkError, clearNetworkError } = useAuth();
  const [slideAnim] = React.useState(new Animated.Value(-100));

  React.useEffect(() => {
    if (networkError) {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide up
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [networkError, slideAnim]);

  const handleRetry = () => {
    clearNetworkError();
    // You can add additional retry logic here if needed
  };

  if (!networkError) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="wifi-outline" size={20} color={COLORS.text} />
        <Text style={styles.message}>
          Connection issue. Some features may not work properly.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    zIndex: 1000,
    paddingTop: 50, // Account for status bar
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  message: {
    flex: 1,
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  retryButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  retryText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
});

export default NetworkStatusBanner;
