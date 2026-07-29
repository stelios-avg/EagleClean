import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { PillButton } from '../../components/ui';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, radii, spacing } from '../../theme';
import type { BookingStackParamList, RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'Confirmation'>;

/** Phase 2: replace with the real ETA from dispatch / crew tracking. */
const ETA_MINUTES = 10;

export default function ConfirmationScreen({ navigation, route }: Props) {
  const { t, language } = useI18n();
  const { date, timeSlot, option, contact } = route.params;

  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const rootNavigation =
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const prettyDate = new Date(date).toLocaleDateString(
    language === 'el' ? 'el-GR' : 'en-GB',
    { weekday: 'long', day: 'numeric', month: 'long' }
  );

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Animated.View style={[styles.checkCircle, { transform: [{ scale }] }]}>
          <Ionicons name="checkmark" size={54} color={colors.textOnDark} />
        </Animated.View>
        <Text style={styles.paidTitle}>{t('confirm.paid')}</Text>

        <View style={styles.etaCard}>
          <View style={styles.etaIconCircle}>
            <Ionicons name="car-sport" size={26} color={colors.textOnDark} />
          </View>
          <Text style={styles.onTheWay}>{t('confirm.onTheWay')}</Text>
          <Text style={styles.etaLabel}>{t('confirm.eta')}</Text>
          <Text style={styles.etaValue}>
            {ETA_MINUTES} {t('confirm.minutes')}
          </Text>
        </View>

        <View style={styles.bookingCard}>
          <Text style={styles.bookingLabel}>{t('confirm.bookingLabel')}</Text>
          <Text style={styles.bookingLine}>
            {t(`service.${option}`)} · {prettyDate} · {timeSlot}
          </Text>
          <Text style={styles.bookingMeta}>{contact.address}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PillButton
          label={t('confirm.home')}
          variant="dark"
          onPress={() =>
            rootNavigation?.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
          }
        />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2FB344',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidTitle: {
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  etaCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    borderRadius: radii.card,
    padding: 26,
    alignItems: 'center',
    gap: 4,
  },
  etaIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  onTheWay: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.textOnDark,
  },
  etaLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textOnDarkMuted,
  },
  etaValue: {
    fontSize: 30,
    fontFamily: fonts.extraBold,
    color: colors.textOnDark,
    letterSpacing: -0.5,
  },
  bookingCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    padding: 18,
    gap: 4,
  },
  bookingLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  bookingLine: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  bookingMeta: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  footer: {
    paddingBottom: 10,
  },
});
