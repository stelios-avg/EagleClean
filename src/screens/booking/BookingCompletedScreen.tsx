import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PressableScale } from '../../components/PressableScale';
import { slotDurationHours } from '../../constants/booking';
import { cleanerForBooking } from '../../constants/team';
import { useI18n } from '../../i18n/LanguageContext';
import { getBookingReview, getMyBooking } from '../../services/bookings';
import { colors, fonts, radii, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';
import type { Booking } from '../../types/database';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingCompleted'>;

const CONFETTI: { top: number; left?: number; right?: number; size: number; color: string }[] = [
  { top: 8, left: 18, size: 8, color: '#F5C542' },
  { top: 0, right: 28, size: 7, color: '#F472B6' },
  { top: 36, left: 4, size: 6, color: '#60A5FA' },
  { top: 22, right: 6, size: 9, color: '#F5C542' },
  { top: 58, left: 22, size: 6, color: '#F472B6' },
  { top: 54, right: 18, size: 7, color: '#60A5FA' },
];

export default function BookingCompletedScreen({ navigation, route }: Props) {
  const { t, language, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const { bookingId, serviceDate, timeSlot, address } = route.params;
  const scale = useRef(new Animated.Value(0.4)).current;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const row = await getMyBooking(bookingId);
        if (alive && row) {
          setBooking(row);
        }
      } catch {
        // Guests and RLS misses still show the congratulations copy from the notice.
      }
      const review = await getBookingReview(bookingId);
      if (alive) {
        setReviewed(Boolean(review));
      }
    })();
    return () => {
      alive = false;
    };
  }, [bookingId]);

  const dateIso = booking?.service_date ?? serviceDate;
  const slot = booking?.time_slot ?? timeSlot;
  const addr = booking?.contact_address ?? address;
  const cleaner = cleanerForBooking(bookingId);
  const hours = slot ? slotDurationHours(slot) : null;
  const hoursLabel =
    hours == null
      ? null
      : hours === 1
        ? t('completed.hoursOne')
        : t('completed.hours', { n: String(hours) });

  const prettyDate = dateIso
    ? new Date(`${dateIso}T12:00:00`).toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const goHome = () =>
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <PressableScale
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : goHome())}
        hitSlop={12}
        style={styles.back}
        accessibilityLabel="Back"
      >
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </PressableScale>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.checkWrap}>
            {CONFETTI.map((dot, index) => (
              <View
                key={index}
                style={[
                  styles.confetti,
                  {
                    backgroundColor: dot.color,
                    width: dot.size,
                    height: dot.size,
                    borderRadius: dot.size / 2,
                    top: dot.top,
                    ...(dot.left != null ? { left: dot.left } : { right: dot.right }),
                  },
                ]}
              />
            ))}
            <Animated.View style={[styles.checkCircle, { transform: [{ scale }] }]}>
              <Ionicons name="checkmark" size={44} color="#FFFFFF" />
            </Animated.View>
          </View>
          <Text style={styles.title}>{t('completed.title')}</Text>
          {prettyDate ? <Text style={styles.date}>{prettyDate}</Text> : null}
        </View>

        {slot ? (
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={18} color={colors.accentDeep} />
            </View>
            <Text style={[styles.rowText, styles.rowTime]}>
              {slot}
              {hoursLabel ? ` (${hoursLabel})` : ''}
            </Text>
          </View>
        ) : null}

        {addr ? (
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={18} color={colors.accentDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('completed.address')}</Text>
              <Text style={styles.rowText}>{addr}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.cleanerCard}>
          <Image source={cleaner.photo} style={styles.cleanerPhoto} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cleanerRole}>{t('completed.cleanerRole')}</Text>
            <Text style={styles.cleanerName}>
              {language === 'el' ? cleaner.nameEl : cleaner.nameEn}
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingNumber}>{cleaner.rating.toFixed(1)}</Text>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={cleaner.rating >= i ? 'star' : cleaner.rating >= i - 0.5 ? 'star-half' : 'star-outline'}
                  size={14}
                  color="#F5C542"
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {!reviewed ? (
            <PressableScale
              onPress={() => navigation.navigate('BookingReview', { bookingId })}
              style={styles.primaryBtn}
            >
              <LinearGradient
                colors={[colors.accentStart, colors.accentEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.primaryLabel}>{t('completed.rate')}</Text>
            </PressableScale>
          ) : null}

          <PressableScale
            onPress={() => navigation.navigate('MyBookings')}
            style={styles.outlineBtn}
          >
            <Text style={styles.outlineLabel}>{t('completed.viewBooking')}</Text>
          </PressableScale>

          <PressableScale onPress={goHome} style={reviewed ? styles.primaryBtn : styles.outlineBtn}>
            {reviewed ? (
              <LinearGradient
                colors={[colors.accentStart, colors.accentEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Text style={reviewed ? styles.primaryLabel : styles.outlineLabel}>
              {t('completed.home')}
            </Text>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  back: {
    width: 40,
    height: 40,
    marginLeft: spacing.screen - 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.screen,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 10,
  },
  checkWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  date: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  rowTime: {
    paddingTop: 8,
  },
  cleanerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    padding: 14,
  },
  cleanerPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.border,
  },
  cleanerRole: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  cleanerName: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  ratingNumber: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginRight: 4,
  },
  footer: {
    marginTop: 8,
    gap: 10,
  },
  primaryBtn: {
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textOnAccent,
  },
  outlineBtn: {
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
  outlineLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.accentDeep,
  },
});
