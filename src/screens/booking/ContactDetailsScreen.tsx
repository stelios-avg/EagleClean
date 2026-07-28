import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormInput, Heading, PillButton, Subtitle } from '../../components/ui';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, spacing } from '../../theme';
import type { BookingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'ContactDetails'>;

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,}$/;

/**
 * Mandatory step before payment: the customer must provide email, phone
 * and address. Validation blocks the continue button until all are valid.
 * Phase 2: these details are saved on the booking record in Supabase.
 */
export default function ContactDetailsScreen({ navigation, route }: Props) {
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [touched, setTouched] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const phoneValid = PHONE_RE.test(phone.trim());
  const addressValid = address.trim().length >= 5;
  const allValid = emailValid && phoneValid && addressValid;

  const submit = () => {
    setTouched(true);
    if (!allValid) {
      return;
    }
    navigation.navigate('Payment', {
      ...route.params,
      contact: {
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Heading>{t('contact.title')}</Heading>
        <Subtitle>{t('contact.step')}</Subtitle>

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
  content: {
    padding: spacing.screen,
    gap: 12,
  },
  form: {
    gap: 16,
    marginVertical: 12,
  },
});
