import React, { useCallback } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandLogo, LanguageToggle, PillButton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();

  // Forward authenticated users to the tabs, but only while this screen is
  // focused — logging in mid-booking must not yank the user out of the flow.
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        navigation.replace('MainTabs');
      }
    }, [isAuthenticated, navigation])
  );

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../../assets/images/hero-welcome.png')}
        style={styles.hero}
        resizeMode="cover"
      >
        {/* Lighter veil up top so the navy logo artwork stays readable without its chip. */}
        <LinearGradient
          colors={['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.25)', 'transparent']}
          style={styles.topGradient}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.82)']}
          style={styles.bottomGradient}
        />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.brandBar}>
            <BrandLogo height={112} chip={false} />
            <View style={styles.langCorner}>
              <LanguageToggle />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.welcomeTitle}>{t('welcome.title')}</Text>
            <Text style={styles.welcomeSubtitle}>{t('welcome.subtitle')}</Text>
            <View style={styles.buttons}>
              <PillButton
                label={t('welcome.bookNow')}
                variant="light"
                onPress={() => navigation.navigate('BookingFlow')}
              />
              <PillButton
                label={t('welcome.loginSignup')}
                variant="ghost"
                onPress={() => navigation.navigate('Auth')}
              />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  hero: {
    flex: 1,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '48%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandBar: {
    alignItems: 'center',
    paddingTop: 14,
  },
  langCorner: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  content: {
    padding: 26,
    gap: 12,
  },
  welcomeTitle: {
    color: colors.textOnDark,
    fontSize: 46,
    fontFamily: fonts.extraBold,
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    color: colors.textOnDarkMuted,
    fontSize: 17,
    fontFamily: fonts.medium,
    lineHeight: 25,
    marginBottom: 14,
  },
  buttons: {
    gap: 12,
  },
});
