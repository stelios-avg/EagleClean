import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BrandTitle } from '../components/ui';
import HomeScreen from '../screens/tabs/HomeScreen';
import MarketplaceScreen from '../screens/tabs/MarketplaceScreen';
import AccountScreen from '../screens/tabs/AccountScreen';
import { colors } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Marketplace: 'storefront-outline',
  Account: 'person-outline',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.ink },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTitle: () => <BrandTitle />,
        tabBarStyle: {
          backgroundColor: colors.ink,
          borderTopWidth: 0,
          height: 62,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} color={color} size={size - 2} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
