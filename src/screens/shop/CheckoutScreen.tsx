import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FormInput, PillButton, SubpageHeader, Subtitle } from '../../components/ui';
import { formatEuros } from '../../constants/payments';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useI18n } from '../../i18n/LanguageContext';
import { getMyProfile, saveContactInfo } from '../../services/profile';
import { createProductOrder } from '../../services/shop';
import { EMAIL_RE, PHONE_RE } from '../../utils/contact';
import { colors, fonts, radii, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopCheckout'>;

/**
 * Final step of the marketplace flow: confirm contact details (prefilled
 * from the profile) and place the order. Payment is settled on delivery,
 * so no card step here.
 */
export default function CheckoutScreen({ navigation }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { items, totalCents, clear } = useCart();

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((profile) => {
        if (!active) {
          return;
        }
        setEmail(profile.email ?? session?.email ?? '');
        setPhone(profile.phone ?? '');
        setAddress(profile.address ?? '');
      })
      .catch(() => {
        if (active) {
          setEmail(session?.email ?? '');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailValid = EMAIL_RE.test(email.trim());
  const phoneValid = PHONE_RE.test(phone.trim());
  const addressValid = address.trim().length >= 5;
  const allValid = emailValid && phoneValid && addressValid;

  const placeOrder = async () => {
    setTouched(true);
    if (!allValid || items.length === 0) {
      return;
    }
    setPlacing(true);
    try {
      const contact = {
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };
      await createProductOrder(
        items.map((i) => ({
          productId: i.product.id,
          nameEl: i.product.name_el,
          nameEn: i.product.name_en,
          variantLabel: i.product.variant_label,
          unitPriceCents: i.product.price_cents,
          quantity: i.quantity,
        })),
        contact
      );
      // Remember the details for next time; ignore failures.
      void saveContactInfo({ phone, address }).catch(() => {});
      clear();
      Alert.alert(t('shop.orderPlacedTitle'), t('shop.orderPlacedBody'), [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Marketplace' } }],
            }),
        },
      ]);
    } catch (e) {
      Alert.alert(t('auth.errorTitle'), (e as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.root}>
      <SubpageHeader
        title={t('shop.checkoutTitle')}
        onBack={() => navigation.goBack()}
        topInset={insets.top}
      />

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.summaryCard}>
              {items.map((i) => (
                <View key={i.product.id} style={styles.summaryRow}>
                  <Text style={styles.summaryQty}>{i.quantity}×</Text>
                  <Text style={styles.summaryName} numberOfLines={1}>
                    {i.product.name_el}
                    {i.product.variant_label ? ` (${i.product.variant_label})` : ''}
                  </Text>
                  <Text style={styles.summaryPrice}>
                    {formatEuros(i.product.price_cents * i.quantity)}
                  </Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>{t('shop.total')}</Text>
                <Text style={styles.totalValue}>{formatEuros(totalCents)}</Text>
              </View>
            </View>

            <View style={styles.payNote}>
              <Ionicons name="cash-outline" size={18} color={colors.accent} />
              <Text style={styles.payNoteText}>{t('shop.payOnDelivery')}</Text>
            </View>

            <Subtitle>{t('shop.checkoutSubtitle')}</Subtitle>

            <View style={styles.form}>
              <FormInput
                label={t('contact.email')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('contact.emailPlaceholder')}
                keyboardType="email-address"
                error={touched && !emailValid ? t('contact.emailError') : undefined}
              />
              <FormInput
                label={t('contact.phone')}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('contact.phonePlaceholder')}
                keyboardType="phone-pad"
                error={touched && !phoneValid ? t('contact.phoneError') : undefined}
              />
              <FormInput
                label={t('contact.address')}
                value={address}
                onChangeText={setAddress}
                placeholder={t('contact.addressPlaceholder')}
                error={touched && !addressValid ? t('contact.addressError') : undefined}
              />
            </View>

            <PillButton
              label={placing ? t('auth.pleaseWait') : t('shop.placeOrder')}
              onPress={placeOrder}
              disabled={placing || items.length === 0}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
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
    paddingBottom: 40,
  },
  summaryCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryQty: {
    fontSize: 13,
    fontFamily: fonts.extraBold,
    color: colors.accent,
    minWidth: 26,
  },
  summaryName: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  summaryPrice: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  totalLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  payNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    padding: 12,
  },
  payNoteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  form: {
    gap: 14,
  },
});
