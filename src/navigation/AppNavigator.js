import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../constants/theme';

// Import screens (we'll create these next)
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PasswordResetScreen from '../screens/auth/PasswordResetScreen';

import HomeScreen from '../screens/main/HomeScreen';
import AstrologersScreen from '../screens/main/AstrologersScreen';
import AstrologerDetailScreen from '../screens/main/AstrologerDetailScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import ChatScreen from '../screens/main/ChatScreen';
import WalletScreen from '../screens/main/WalletScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

import AstrologerDetailsScreen from '../screens/astrologer/AstrologerDetailsScreen';
import ChatSessionScreen from '../screens/chat/ChatSessionScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.text,
      headerTitleStyle: {
        fontFamily: FONTS.medium,
        fontSize: FONTS.lg,
      },
    }}
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{ title: 'Create Account' }}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ title: 'Reset Password' }}
    />
    <Stack.Screen
      name="PasswordReset"
      component={PasswordResetScreen}
      options={{ title: 'Reset Password' }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Astrologers':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'Chat':
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            break;
          case 'Wallet':
            iconName = focused ? 'wallet' : 'wallet-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'circle';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.accent,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontFamily: FONTS.medium,
        fontSize: FONTS.xs,
      },
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.text,
      headerTitleStyle: {
        fontFamily: FONTS.medium,
        fontSize: FONTS.lg,
      },
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Astrotalk' }}
    />
    <Tab.Screen 
      name="Astrologers" 
      component={AstrologersScreen}
      options={{ title: 'Astrologers' }}
    />
    <Tab.Screen 
      name="Chat" 
      component={ChatScreen}
      options={{ title: 'My Chats' }}
    />
    <Tab.Screen 
      name="Wallet" 
      component={WalletScreen}
      options={{ title: 'Wallet' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

// Main Stack Navigator (includes tabs and modal screens)
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.text,
      headerTitleStyle: {
        fontFamily: FONTS.medium,
        fontSize: FONTS.lg,
      },
    }}
  >
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AstrologerDetail"
      component={AstrologerDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{ title: 'My Favorites' }}
    />
    <Stack.Screen
      name="AstrologerDetails"
      component={AstrologerDetailsScreen}
      options={{ title: 'Astrologer Profile' }}
    />
    <Stack.Screen
      name="ChatSession"
      component={ChatSessionScreen}
      options={({ route }) => ({
        title: route.params?.astrologerName || 'Chat Session',
        headerBackTitleVisible: false,
      })}
    />
  </Stack.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;
