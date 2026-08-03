import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

/** Shrinks long Greek labels instead of truncating with ellipsis. */
function TabLabel({ label, color }: { label: string; color: string }) {
  return (
    <Text
      style={[styles.tabLabel, { color }]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      allowFontScaling={false}
    >
      {label}
    </Text>
  );
}

/** Photo behind the logo in the Marketplace header, dimmed for readability. */
function MarketplaceHeaderBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require('../../assets/images/marketplace-products.png')}
        style={styles.headerPhoto}
        resizeMode="cover"
      />
      <View style={styles.headerPhotoDim} />
    </View>
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
        headerStyle: { backgroundColor: colors.accent },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTitle: () => <BrandLogo height={34} />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 56 + bottomPad,
          paddingTop: 6,
          paddingBottom: bottomPad,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarAllowFontScaling: false,
        tabBarLabel: ({ color }) => (
          <TabLabel
            label={
              route.name === 'Home'
                ? t('tab.home')
                : route.name === 'Marketplace'
                  ? t('tab.marketplace')
                  : t('tab.account')
            }
            color={color}
          />
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
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          title: t('tab.marketplace'),
          headerBackground: MarketplaceHeaderBackground,
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
  headerPhoto: {
    width: '100%',
    height: '100%',
  },
  headerPhotoDim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11,12,16,0.35)',
  },
});
