import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import NetworkStatusBanner from './src/components/NetworkStatusBanner';
import linkingService from './src/services/linkingService';

export default function App() {
  useEffect(() => {
    // Initialize linking service when app starts
    linkingService.initialize();

    // Cleanup on app unmount
    return () => {
      linkingService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <NetworkStatusBanner />
          <StatusBar style="light" backgroundColor="#1a1a2e" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
