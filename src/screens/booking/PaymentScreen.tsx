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
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, radii, spacing } from '../../theme';
import type { BookingStackParamList, RootStackParamList } from '../../navigation/types';

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
  const { date, timeSlot, option, contact } = route.params;
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
              label: `${t(`service.${option}`)} — ${date} ${timeSlot}`,
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

      // Phase 2: save the paid booking (incl. contact details) in Supabase.
      Alert.alert(t('payment.successTitle'), t('payment.successBody'), [
        {
          text: 'OK',
          onPress: () =>
            rootNavigation?.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
        },
      ]);
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
          {t(`service.${option}`)} · {date} · {timeSlot}
        </Text>
        <Text style={styles.totalMeta}>
          {contact.email} · {contact.phone}
        </Text>
        <Text style={styles.totalMeta}>{contact.address}</Text>
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
