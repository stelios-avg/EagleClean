import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '../components/ui';
import HomeScreen from '../screens/tabs/HomeScreen';
import MarketplaceScreen from '../screens/tabs/MarketplaceScreen';
import AccountScreen from '../screens/tabs/AccountScreen';
import { useI18n } from '../i18n/LanguageContext';
import { colors, fonts } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Outline icon when idle, filled icon when the tab is active. */
const TAB_ICONS: Record<
  keyof MainTabParamList,
  { idle: keyof typeof Ionicons.glyphMap; active: keyof typeof Ionicons.glyphMap }
> = {
  Home: { idle: 'home-outline', active: 'home' },
  Marketplace: { idle: 'bag-handle-outline', active: 'bag-handle' },
  Account: { idle: 'person-circle-outline', active: 'person-circle' },
};

export default function MainTabNavigator() {
  const { t } = useI18n();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.ink },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTitle: () => <BrandLogo height={34} />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 62,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semiBold },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].idle}
            color={color}
            size={size - 1}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('tab.home'), headerShown: false }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{ title: t('tab.marketplace') }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: t('tab.account') }}
      />
    </Tab.Navigator>
  );
}
