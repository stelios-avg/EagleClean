import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, PillButton, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { SERVICE_PRICES, formatEuros } from '../../constants/payments';
import { colors, fonts, radii, spacing } from '../../theme';
import type { BookingStackParamList, RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingSummary'>;

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={19} color={colors.accent} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/**
 * End of the guest booking flow — this is where the Guest -> Authenticated
 * handoff happens. Guests get "Log in to confirm", which opens the Auth
 * modal on top; the selection here stays intact underneath. Authenticated
 * users continue to the mandatory Contact Details step, then Payment.
 */
export default function BookingSummaryScreen({ navigation, route }: Props) {
  const { isAuthenticated } = useAuth();
  const { t, locale } = useI18n();
  const { date, timeSlot, category, option } = route.params;
  const amount = SERVICE_PRICES[option];

  const prettyDate = new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const rootNavigation =
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      <View>
        <Heading>{t('summary.title')}</Heading>
        <Subtitle>{t('summary.subtitle')}</Subtitle>

        <View style={styles.card}>
          <SummaryRow
            icon="briefcase-outline"
            label={t('summary.service')}
            value={category === 'my-home' ? t('services.myHome') : t('services.crew')}
          />
          <SummaryRow
            icon="options-outline"
            label={t('summary.option')}
            value={t(`service.${option}`)}
          />
          <SummaryRow icon="calendar-outline" label={t('summary.day')} value={prettyDate} />
          <SummaryRow icon="time-outline" label={t('summary.time')} value={timeSlot} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('summary.total')}</Text>
            <Text style={styles.totalValue}>{formatEuros(amount)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {isAuthenticated ? (
          <PillButton
            label={t('summary.continue')}
            onPress={() => navigation.navigate('ContactDetails', route.params)}
          />
        ) : (
          <>
            <Subtitle>{t('summary.loginPrompt')}</Subtitle>
            <PillButton
              label={t('summary.loginToConfirm')}
              onPress={() => rootNavigation?.navigate('Auth')}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.screen,
    justifyContent: 'space-between',
  },
  card: {
    marginTop: 18,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  footer: {
    gap: 12,
    paddingBottom: 10,
  },
});
