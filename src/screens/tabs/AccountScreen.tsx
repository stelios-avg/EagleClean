import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  Heading,
  LanguageToggle,
  ListRow,
  PillButton,
  ScreenContainer,
  Subtitle,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, radii, spacing } from '../../theme';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

function LanguageRow() {
  const { t } = useI18n();
  return (
    <View style={styles.langRow}>
      <View style={styles.langLabelRow}>
        <View style={styles.langIcon}>
          <Ionicons name="globe-outline" size={20} color={colors.accent} />
        </View>
        <Text style={styles.langText}>{t('account.language')}</Text>
      </View>
      <LanguageToggle />
    </View>
  );
}

export default function AccountScreen({ navigation }: Props) {
  const { session, isAuthenticated, signOut } = useAuth();
  const { t } = useI18n();

  if (!isAuthenticated) {
    return (
      <ScreenContainer style={styles.guestContainer}>
        <View style={styles.guestIcon}>
          <Ionicons name="person-circle-outline" size={72} color={colors.accent} />
        </View>
        <Heading>{t('account.guestTitle')}</Heading>
        <Subtitle>{t('account.guestSubtitle')}</Subtitle>
        <View style={{ height: 8 }} />
        <PillButton
          label={t('welcome.loginSignup')}
          onPress={() => navigation.navigate('Auth')}
        />
        <View style={{ height: 12 }} />
        <LanguageRow />
      </ScreenContainer>
    );
  }

  const purchaseMembership = () => {
    // Phase 3: Stripe Billing recurring subscription (EUR 14.99/month).
    Alert.alert(t('account.membership'), t('account.membershipSoon'));
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Heading>{t('account.title')}</Heading>

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {session?.email.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.profileName}>{t('account.welcomeBack')}</Text>
          <Text style={styles.profileEmail}>{session?.email}</Text>
        </View>
      </View>

      {/* Membership card */}
      <View style={styles.membershipCard}>
        <View style={styles.membershipHeader}>
          <Ionicons name="sparkles" size={18} color={colors.textOnDark} />
          <Text style={styles.membershipBrand}>{t('account.membership')}</Text>
        </View>
        <Text style={styles.membershipPrice}>
          €14.99<Text style={styles.membershipPeriod}>{t('account.perMonth')}</Text>
        </Text>
        <Text style={styles.membershipPerks}>{t('account.perks')}</Text>
        <PillButton
          label={t('account.become')}
          variant="light"
          onPress={purchaseMembership}
        />
      </View>

      <ListRow
        icon="receipt-outline"
        label={t('account.orders')}
        sublabel={t('account.ordersSub')}
        onPress={() => Alert.alert(t('account.orders'), t('account.ordersSoon'))}
      />

      <LanguageRow />

      <ListRow icon="log-out-outline" label={t('account.signOut')} onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    gap: 14,
  },
  guestContainer: {
    justifyContent: 'center',
  },
  guestIcon: {
    alignItems: 'flex-start',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textOnDark,
    fontSize: 22,
    fontFamily: fonts.extraBold,
  },
  profileName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  membershipCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.card,
    padding: 24,
    gap: 10,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  membershipBrand: {
    color: colors.textOnDark,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  membershipPrice: {
    color: colors.textOnDark,
    fontSize: 36,
    fontFamily: fonts.extraBold,
    letterSpacing: -0.5,
  },
  membershipPeriod: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textOnDarkMuted,
  },
  membershipPerks: {
    color: colors.textOnDarkMuted,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
    marginBottom: 8,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radii.row,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  langLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  langIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
});
