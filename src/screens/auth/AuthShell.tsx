import React from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo, LanguageToggle } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { colors, fonts, radii, spacing } from '../../theme';

/**
 * Shared chrome for Login / SignUp: photo hero with brand, then a soft
 * overlapping form sheet. Close dismisses the Auth modal.
 */
export default function AuthShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <ImageBackground
          source={require('../../../assets/images/auth-hero.png')}
          style={styles.hero}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(11,12,16,0.45)', 'rgba(11,12,16,0.2)', 'rgba(11,12,16,0.72)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroTop, { paddingTop: insets.top + 8 }]}>
            <PressableScale
              onPress={onClose}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={colors.textOnDark} />
            </PressableScale>
            <LanguageToggle onDark />
          </View>
          <View style={styles.heroBrand}>
            <BrandLogo height={44} />
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>
          </View>
        </ImageBackground>

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.form}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    minHeight: 280,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingBottom: 40,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBrand: {
    gap: 10,
    paddingBottom: 8,
  },
  heroTitle: {
    marginTop: 6,
    color: colors.textOnDark,
    fontSize: 32,
    fontFamily: fonts.extraBold,
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  heroSubtitle: {
    color: colors.textOnDarkMuted,
    fontSize: 15,
    fontFamily: fonts.medium,
    lineHeight: 22,
    maxWidth: 320,
  },
  sheet: {
    marginTop: -28,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: spacing.screen,
    paddingTop: 14,
    flexGrow: 1,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 18,
  },
  form: {
    gap: 12,
  },
  footer: {
    marginTop: 18,
    alignItems: 'center',
    gap: 4,
  },
});
