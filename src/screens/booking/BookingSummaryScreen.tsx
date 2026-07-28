import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, PillButton, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { SERVICE_PRICES, formatEuros } from '../../constants/payments';
import { colors, radii, spacing } from '../../theme';
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
 * modal on top; the selection here stays intact underneath.
 */
export default function BookingSummaryScreen({ navigation, route }: Props) {
  const { isAuthenticated } = useAuth();
  const { date, timeSlot, category, option } = route.params;
  const amount = SERVICE_PRICES[option];

  const prettyDate = new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const rootNavigation =
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      <View>
        <Heading>Booking summary</Heading>
        <Subtitle>Review your cleaning before payment.</Subtitle>

        <View style={styles.card}>
          <SummaryRow
            icon="briefcase-outline"
            label="Service"
            value={category === 'my-home' ? 'My Home' : 'Cleaning Crew'}
          />
          <SummaryRow icon="options-outline" label="Option" value={option} />
          <SummaryRow icon="calendar-outline" label="Day" value={prettyDate} />
          <SummaryRow icon="time-outline" label="Time" value={timeSlot} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatEuros(amount)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {isAuthenticated ? (
          <PillButton
            label="Continue to payment"
            onPress={() => navigation.navigate('Payment', route.params)}
          />
        ) : (
          <>
            <Subtitle>Log in or create an account to confirm your booking.</Subtitle>
            <PillButton
              label="Log in to confirm"
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
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
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
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  footer: {
    gap: 12,
    paddingBottom: 10,
  },
});
