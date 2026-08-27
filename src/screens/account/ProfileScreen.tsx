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
import { FormInput, PillButton, SubpageHeader, Subtitle } from '../../components/ui';
import { UseMyLocationButton } from '../../components/UseMyLocationButton';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { geocodeAddress } from '../../services/deviceAddress';
import { getMyProfile, updateMyProfile } from '../../services/profile';
import { colors, fonts, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { t } = useI18n();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        setFullName(profile.full_name ?? '');
        setPhone(profile.phone ?? '');
        setAddress(profile.address ?? '');
        setLatitude(profile.address_lat);
        setLongitude(profile.address_lng);
      })
      .catch((e) => Alert.alert(t('auth.errorTitle'), (e as Error).message))
      .finally(() => setLoading(false));
  }, [t]);

  const save = async () => {
    setSaving(true);
    try {
      let lat = latitude;
      let lng = longitude;
      if (lat == null || lng == null) {
        const pin = await geocodeAddress(address);
        lat = pin?.latitude ?? null;
        lng = pin?.longitude ?? null;
      }
      await updateMyProfile({ fullName, phone, address, latitude: lat, longitude: lng });
      Alert.alert(t('profile.savedTitle'), t('profile.savedBody'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(t('auth.errorTitle'), (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <SubpageHeader
        title={t('profile.title')}
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
            <Subtitle>{t('profile.subtitle')}</Subtitle>
            <View style={styles.emailRow}>
              <Text style={styles.emailLabel}>{t('auth.email')}</Text>
              <Text style={styles.emailValue}>{session?.email}</Text>
            </View>
            <FormInput
              label={t('auth.fullName')}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('auth.fullNamePlaceholder')}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              icon="person-outline"
            />
            <FormInput
              label={t('contact.phone')}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('contact.phonePlaceholder')}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              icon="call-outline"
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
              autoComplete="street-address"
              textContentType="fullStreetAddress"
              icon="home-outline"
            />
            <UseMyLocationButton
              onLocated={({ address: next, latitude: lat, longitude: lng }) => {
                setAddress(next);
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
            <View style={{ height: 8 }} />
            <PillButton
              label={saving ? t('auth.pleaseWait') : t('profile.save')}
              onPress={save}
              disabled={saving}
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
  },
  emailRow: {
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
  },
  emailLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
  },
  emailValue: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
});
