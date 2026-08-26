import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  PlatformPay,
  PlatformPayButton,
  confirmPlatformPayPayment,
  isPlatformPaySupported,
} from '@stripe/stripe-react-native';
import { Heading, PillButton, Subtitle } from '../../components/ui';
import {
  CURRENCY_CODE,
  MERCHANT_COUNTRY_CODE,
  MERCHANT_NAME,
  bookingTotalCents,
  formatEuros,
} from '../../constants/payments';
import { useI18n } from '../../i18n/LanguageContext';
import { createBooking } from '../../services/bookings';
import { colors, fonts, radii, spacing } from '../../theme';
import type { BookingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'Payment'>;

/**
 * Phase 2: replace with a Supabase Edge Function that creates a Stripe
 * PaymentIntent server-side (with the booking + contact details in
 * metadata) and returns its client_secret.
 */
async function fetchPaymentIntentClientSecret(_amount: number): Promise<string> {
  throw new Error(
    'Payment backend not connected yet. A Supabase Edge Function will create the PaymentIntent in Phase 2.'
  );
}

export default function PaymentScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const amount = bookingTotalCents(
    route.params.option,
    route.params.extraHours,
    route.params.squareMeters,
    route.params.rooms
  );

  const [platformPayAvailable, setPlatformPayAvailable] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      setPlatformPayAvailable(
        await isPlatformPaySupported({ googlePay: { testEnv: true } })
      );
    })();
  }, []);

  const saveAndConfirm = async (paymentIntentId?: string | null) => {
    await createBooking({
      ...route.params,
      status: 'paid',
      paymentIntentId: paymentIntentId ?? null,
    });
    // Replace so the back gesture can't return to the payment screen.
    navigation.replace('Confirmation', route.params);
  };

  const pay = async () => {
    setProcessing(true);
    try {
      const clientSecret = await fetchPaymentIntentClientSecret(amount);

      const { error } = await confirmPlatformPayPayment(clientSecret, {
        applePay: {
          cartItems: [
            {
              label: `${t(`service.${route.params.option}`)} — ${route.params.date} ${route.params.timeSlot}`,
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
        Alert.alert(t('payment.failedTitle'), error.message);
        return;
      }

      await saveAndConfirm();
    } catch (e) {
      Alert.alert(t('payment.unavailableTitle'), (e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const simulatePay = async () => {
    setProcessing(true);
    try {
      await saveAndConfirm(`sim_${Date.now()}`);
    } catch (e) {
      Alert.alert(t('payment.unavailableTitle'), (e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.root}>
      <View>
        <Heading>{t('payment.title')}</Heading>
        <Subtitle>{t('payment.subtitle')}</Subtitle>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>{t('payment.total')}</Text>
        <Text style={styles.totalValue}>{formatEuros(amount)}</Text>
        <Text style={styles.totalMeta}>
          {t(`service.${route.params.option}`)} · {route.params.date} ·{' '}
          {route.params.timeSlot}
        </Text>
        <Text style={styles.totalMeta}>
          {route.params.contact.name}
          {route.params.contact.phone ? ` · ${route.params.contact.phone}` : ''}
        </Text>
        {route.params.contact.email ? (
          <Text style={styles.totalMeta}>{route.params.contact.email}</Text>
        ) : null}
        <Text style={styles.totalMeta}>{route.params.contact.address}</Text>
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
          <Subtitle>{t('payment.walletUnavailable')}</Subtitle>
        )}
        {__DEV__ && (
          <PillButton
            label={t('payment.simulate')}
            variant="outline"
            onPress={simulatePay}
            disabled={processing}
          />
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
    fontFamily: fonts.semiBold,
  },
  totalValue: {
    color: colors.textOnDark,
    fontSize: 42,
    fontFamily: fonts.extraBold,
    letterSpacing: -1,
  },
  totalMeta: {
    color: colors.textOnDarkMuted,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  footer: {
    paddingBottom: 10,
    gap: 10,
  },
  payButton: {
    height: 54,
  },
});
