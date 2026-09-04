import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '../components/ui';
import HomeScreen from '../screens/tabs/HomeScreen';
import PlansScreen from '../screens/tabs/PlansScreen';
import MarketplaceScreen from '../screens/tabs/MarketplaceScreen';
import AccountScreen from '../screens/tabs/AccountScreen';
import { useI18n } from '../i18n/LanguageContext';
import type { TranslationKey } from '../i18n/translations';
import { colors, fonts, shadows } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Outline icon when idle, filled icon when the tab is active. */
const TAB_ICONS: Record<
  keyof MainTabParamList,
  { idle: keyof typeof Ionicons.glyphMap; active: keyof typeof Ionicons.glyphMap }
> = {
  Home: { idle: 'home-outline', active: 'home' },
  Plans: { idle: 'cube-outline', active: 'cube' },
  Marketplace: { idle: 'bag-handle-outline', active: 'bag-handle' },
  Account: { idle: 'person-circle-outline', active: 'person-circle' },
};

const TAB_LABELS: Record<keyof MainTabParamList, TranslationKey> = {
  Home: 'tab.home',
  Plans: 'tab.plans',
  Marketplace: 'tab.marketplace',
  Account: 'tab.account',
};

/** Shrinks long Greek labels instead of truncating with ellipsis. */
function TabLabel({ label, color }: { label: string; color: string }) {
  return (
    <Text
      style={[styles.tabLabel, { color }]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.68}
      allowFontScaling={false}
    >
      {label}
    </Text>
  );
}

export default function MainTabNavigator() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        animation: 'shift',
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTitle: () => <BrandLogo height={36} chip={false} />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          height: 60 + bottomPad,
          paddingTop: 8,
          paddingBottom: bottomPad,
          ...shadows.bar,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarAllowFontScaling: false,
        tabBarLabel: ({ color }) => (
          <TabLabel label={t(TAB_LABELS[route.name])} color={color} />
        ),
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].idle}
            color={color}
            size={22}
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
        name="Plans"
        component={PlansScreen}
        options={{ title: t('tab.plans'), headerShown: false }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          title: t('tab.marketplace'),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: t('tab.account'), headerShown: false }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
    marginTop: 2,
    width: '100%',
    paddingHorizontal: 2,
  },
});
