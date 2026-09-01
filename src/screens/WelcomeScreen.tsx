import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <View style={styles.langCorner}>
            <LanguageToggle />
          </View>
        </View>

        <View style={styles.cover}>
          <BrandLogo height={168} chip={false} />
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeTitle}>{t('welcome.title')}</Text>
          <Text style={styles.welcomeSubtitle}>{t('welcome.subtitle')}</Text>
          <View style={styles.buttons}>
            <PillButton
              label={t('welcome.bookNow')}
              onPress={() => navigation.navigate('BookingFlow')}
            />
            <PillButton
              label={t('welcome.loginSignup')}
              variant="outline"
              onPress={() => navigation.navigate('Auth')}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  langCorner: {
    alignSelf: 'flex-end',
  },
  cover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  content: {
    paddingHorizontal: 26,
    paddingBottom: 28,
    gap: 12,
  },
  welcomeTitle: {
    color: colors.textPrimary,
    fontSize: 40,
    fontFamily: fonts.extraBold,
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    color: colors.textSecondary,
    fontSize: 17,
    fontFamily: fonts.medium,
    lineHeight: 25,
    marginBottom: 8,
  },
  buttons: {
    gap: 12,
  },
});
