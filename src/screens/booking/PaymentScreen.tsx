import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  PlatformPay,
  PlatformPayButton,
  confirmPlatformPayPayment,
  isPlatformPaySupported,
} from '@stripe/stripe-react-native';
import { Heading, Subtitle } from '../../components/ui';
import {
  CURRENCY_CODE,
  MERCHANT_COUNTRY_CODE,
  MERCHANT_NAME,
  SERVICE_PRICES,
  formatEuros,
} from '../../constants/payments';
import { colors, radii, spacing } from '../../theme';
import type { BookingStackParamList, RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'Payment'>;

/**
 * Phase 2: replace with a Supabase Edge Function that creates a Stripe
 * PaymentIntent server-side and returns its client_secret.
 */
async function fetchPaymentIntentClientSecret(_amount: number): Promise<string> {
  throw new Error(
    'Payment backend not connected yet. A Supabase Edge Function will create the PaymentIntent in Phase 2.'
  );
}

export default function PaymentScreen({ navigation, route }: Props) {
  const { date, timeSlot, option } = route.params;
  const amount = SERVICE_PRICES[option];

  const [platformPayAvailable, setPlatformPayAvailable] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      setPlatformPayAvailable(
        await isPlatformPaySupported({ googlePay: { testEnv: true } })
      );
    })();
  }, []);

  const rootNavigation =
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const pay = async () => {
    setProcessing(true);
    try {
      const clientSecret = await fetchPaymentIntentClientSecret(amount);

      const { error } = await confirmPlatformPayPayment(clientSecret, {
        applePay: {
          cartItems: [
            {
              label: `${option} — ${date} ${timeSlot}`,
              amount: (amount / 100).toFixed(2),
              paymentType: PlatformPay.PaymentType.Immediate,
            },
          ],
          merchantCountryCode: MERCHANT_COUNTRY_CODE,
          currencyCode: CURRENCY_CODE,
        },
        googlePay: {
          testEnv: true, // switch to false in production
          merchantName: MERCHANT_NAME,
          merchantCountryCode: MERCHANT_COUNTRY_CODE,
          currencyCode: CURRENCY_CODE,
        },
      });

      if (error) {
        Alert.alert('Payment failed', error.message);
        return;
      }

      // Phase 2: mark the booking as paid in Supabase before navigating.
      Alert.alert('Payment successful', 'Your cleaning is booked!', [
        {
          text: 'OK',
          onPress: () =>
            rootNavigation?.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
        },
      ]);
    } catch (e) {
      Alert.alert('Payment unavailable', (e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.root}>
      <View>
        <Heading>Payment</Heading>
        <Subtitle>Pay securely with your device wallet.</Subtitle>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total to pay</Text>
        <Text style={styles.totalValue}>{formatEuros(amount)}</Text>
        <Text style={styles.totalMeta}>
          {option} · {date} · {timeSlot}
        </Text>
      </View>

      <View style={styles.footer}>
        {platformPayAvailable ? (
          <PlatformPayButton
            onPress={pay}
            disabled={processing}
            type={PlatformPay.ButtonType.Pay}
            appearance={PlatformPay.ButtonStyle.Black}
            borderRadius={radii.pill}
            style={styles.payButton}
          />
        ) : (
          <Subtitle>
            Apple Pay / Google Pay is not available on this device. Wallet
            payments require a development build (not Expo Go); a card payment
            fallback arrives in Phase 3.
          </Subtitle>
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
  totalCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.card,
    padding: 26,
    gap: 6,
  },
  totalLabel: {
    color: colors.textOnDarkMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    color: colors.textOnDark,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  totalMeta: {
    color: colors.textOnDarkMuted,
    fontSize: 14,
  },
  footer: {
    paddingBottom: 10,
    gap: 10,
  },
  payButton: {
    height: 54,
  },
});
