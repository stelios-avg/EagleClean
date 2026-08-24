import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormInput, Heading, PillButton, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { getMyProfile, saveContactInfo } from '../../services/profile';
import { EMAIL_RE, PHONE_RE } from '../../utils/contact';
import { colors, spacing } from '../../theme';
import type { BookingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'ContactDetails'>;

/**
 * Shown only when the signed-in customer's profile is missing contact
 * details (first booking, usually). Fields are prefilled from the
 * profile, and whatever the customer enters is saved back so the next
 * booking skips this step entirely.
 */
export default function ContactDetailsScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
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

  const submit = () => {
    setTouched(true);
    if (!allValid) {
      return;
    }
    // Persist for future bookings; a failure here shouldn't block payment.
    void saveContactInfo({ phone, address }).catch(() => {});
    navigation.navigate('Payment', {
      ...route.params,
      contact: {
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Heading>{t('contact.title')}</Heading>
        <Subtitle>{t('contact.saveHint')}</Subtitle>

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
          label={t('contact.continue')}
          onPress={submit}
          disabled={touched && !allValid}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.screen,
    gap: 12,
  },
  form: {
    gap: 16,
    marginVertical: 12,
  },
});
