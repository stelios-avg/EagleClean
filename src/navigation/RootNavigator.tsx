import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import MainTabNavigator from './MainTabNavigator';
import BookingNavigator from './BookingNavigator';
import AuthNavigator from './AuthNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root of the app. All four top-level destinations are ALWAYS registered
 * (rather than conditionally rendered on auth state) because this app allows
 * guests to do almost everything:
 *
 *  - MainTabs:    the main menu (Home / Marketplace / Customer Account),
 *                 shown immediately on launch for guests and users alike
 *  - Welcome:     kept as a secondary marketing screen
 *  - BookingFlow: the sequential booking stack, reachable as guest OR user
 *  - Auth:        login/sign-up, presented as a modal over anything
 *
 * Keeping every route mounted means logging in never destroys navigation
 * state — a guest halfway through a booking keeps their selections when the
 * Auth modal closes.
 */
export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="BookingFlow" component={BookingNavigator} />
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
