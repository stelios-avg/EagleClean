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
import { UseMyLocationButton } from '../../components/UseMyLocationButton';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { geocodeAddress } from '../../services/deviceAddress';
import { getMyProfile, saveContactInfo } from '../../services/profile';
import { EMAIL_RE, PHONE_RE } from '../../utils/contact';
import { colors, spacing } from '../../theme';
import type { BookingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'ContactDetails'>;

/**
 * Collects name, phone, and address before payment. Guests can continue
 * without an account. Signed-in customers get fields prefilled from the
 * profile and saved back so the next booking can skip this step.
 */
export default function ContactDetailsScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { isAuthenticated, session } = useAuth();

  const [loading, setLoading] = useState(isAuthenticated);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    let active = true;
    getMyProfile()
      .then((profile) => {
        if (!active) {
          return;
        }
        setName(profile.full_name ?? '');
        setEmail(profile.email ?? session?.email ?? '');
        setPhone(profile.phone ?? '');
        setAddress(profile.address ?? '');
        setLatitude(profile.address_lat);
        setLongitude(profile.address_lng);
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
  }, [isAuthenticated]);

  const nameValid = name.trim().length >= 2;
  const emailTrimmed = email.trim();
  const emailValid = emailTrimmed.length === 0 || EMAIL_RE.test(emailTrimmed);
  const phoneValid = PHONE_RE.test(phone.trim());
  const addressValid = address.trim().length >= 5;
  const allValid = nameValid && emailValid && phoneValid && addressValid;

  const submit = () => {
    setTouched(true);
    if (!allValid) {
      return;
    }
    void (async () => {
      let lat = latitude;
      let lng = longitude;
      if (lat == null || lng == null) {
        const pin = await geocodeAddress(address);
        lat = pin?.latitude ?? null;
        lng = pin?.longitude ?? null;
      }
      void saveContactInfo({
        fullName: name,
        phone,
        address,
        latitude: lat,
        longitude: lng,
      }).catch(() => {});
      navigation.navigate('Payment', {
        ...route.params,
        contact: {
          name: name.trim(),
          email: emailTrimmed,
          phone: phone.trim(),
          address: address.trim(),
          latitude: lat,
          longitude: lng,
        },
      });
    })();
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
        <Subtitle>
          {isAuthenticated ? t('contact.saveHint') : t('contact.guestHint')}
        </Subtitle>

        <View style={styles.form}>
          <FormInput
            label={t('contact.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('contact.namePlaceholder')}
            autoCapitalize="words"
            error={touched && !nameValid ? t('contact.nameError') : undefined}
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
            onChangeText={(text) => {
              setAddress(text);
              setLatitude(null);
              setLongitude(null);
            }}
            placeholder={t('contact.addressPlaceholder')}
            error={touched && !addressValid ? t('contact.addressError') : undefined}
          />
          <UseMyLocationButton
            onLocated={({ address: next, latitude: lat, longitude: lng }) => {
              setAddress(next);
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
          <FormInput
            label={t('contact.emailOptional')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('contact.emailPlaceholder')}
            keyboardType="email-address"
            error={touched && !emailValid ? t('contact.emailError') : undefined}
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
