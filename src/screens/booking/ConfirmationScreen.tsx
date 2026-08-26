import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { PillButton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, radii, spacing } from '../../theme';
import type { BookingStackParamList, RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'Confirmation'>;

export default function ConfirmationScreen({ navigation, route }: Props) {
  const { t, language } = useI18n();
  const { isAuthenticated } = useAuth();
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

  const goHome = () =>
    rootNavigation?.reset({ index: 0, routes: [{ name: 'MainTabs' }] });

  const goToBookings = () =>
    rootNavigation?.reset({
      index: 1,
      routes: [{ name: 'MainTabs' }, { name: 'MyBookings' }],
    });

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Animated.View style={[styles.checkCircle, { transform: [{ scale }] }]}>
          <Ionicons name="checkmark" size={54} color={colors.textOnDark} />
        </Animated.View>
        <Text style={styles.paidTitle}>{t('confirm.paid')}</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusIconCircle}>
            <Ionicons name="hourglass-outline" size={26} color={colors.textOnAccent} />
          </View>
          <Text style={styles.statusTitle}>{t('confirm.pendingTitle')}</Text>
          <Text style={styles.statusBody}>{t('confirm.pendingBody')}</Text>
        </View>

        <View style={styles.bookingCard}>
          <Text style={styles.bookingLabel}>{t('confirm.when')}</Text>
          <Text style={styles.bookingLine}>
            {prettyDate} · {timeSlot}
          </Text>
          <Text style={styles.bookingMeta}>
            {contact.name} · {t(`service.${option}`)} · {contact.address}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {isAuthenticated ? (
          <PillButton label={t('confirm.viewBookings')} onPress={goToBookings} />
        ) : null}
        <PillButton
          label={t('confirm.home')}
          variant={isAuthenticated ? 'outline' : 'accent'}
          onPress={goHome}
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
  statusCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    borderRadius: radii.card,
    padding: 26,
    alignItems: 'center',
    gap: 6,
  },
  statusIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(26,22,8,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statusTitle: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.textOnAccent,
    textAlign: 'center',
  },
  statusBody: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
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
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  bookingMeta: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  footer: {
    paddingBottom: 10,
    gap: 10,
  },
});
