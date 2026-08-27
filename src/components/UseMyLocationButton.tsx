import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { useI18n } from '../i18n/LanguageContext';
import { readDeviceAddress } from '../services/deviceAddress';
import { colors, fonts, radii } from '../theme';

/** Fills the address field from the phone's current GPS position. */
export function UseMyLocationButton({
  onLocated,
}: {
  onLocated: (result: { address: string; latitude: number; longitude: number }) => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  const onPress = async () => {
    setBusy(true);
    const result = await readDeviceAddress();
    setBusy(false);
    if (!result.ok) {
      Alert.alert(
        t(result.reason === 'permission-denied' ? 'area.deniedTitle' : 'area.unavailableTitle'),
        t(result.reason === 'permission-denied' ? 'area.deniedBody' : 'contact.locationFailed')
      );
      return;
    }
    onLocated({
      address: result.address || t('contact.currentLocation'),
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
    });
  };

  return (
    <PressableScale
      onPress={() => void onPress()}
      disabled={busy}
      accessibilityLabel={t('contact.useLocation')}
      style={styles.btn}
    >
      {busy ? (
        <ActivityIndicator color={colors.accentDeep} size="small" />
      ) : (
        <Ionicons name="navigate" size={16} color={colors.accentDeep} />
      )}
      <Text style={styles.label}>
        {busy ? t('contact.locating') : t('contact.useLocation')}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -4,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.accentDeep,
  },
});
