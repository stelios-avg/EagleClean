import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SubpageHeader } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { formatEuros } from '../../constants/payments';
import { useI18n } from '../../i18n/LanguageContext';
import { supabase } from '../../lib/supabase';
import { cancelBooking, listMyBookings } from '../../services/bookings';
import { colors, fonts, radii, spacing } from '../../theme';
import type { TranslationKey } from '../../i18n/translations';
import type { RootStackParamList } from '../../navigation/types';
import type { Booking, BookingStatus } from '../../types/database';

type Props = NativeStackScreenProps<RootStackParamList, 'MyBookings'>;

const STATUS_COLORS: Record<BookingStatus, { bg: string; fg: string }> = {
  pending: { bg: '#FEF3C7', fg: '#92400E' },
  paid: { bg: '#D4F4F4', fg: '#1A8F8F' },
  accepted: { bg: '#D1FAE5', fg: '#065F46' },
  rejected: { bg: '#FEE2E2', fg: '#B91C1C' },
  completed: { bg: '#F4F4F5', fg: '#3F3F46' },
  cancelled: { bg: '#F4F4F5', fg: '#A1A1AA' },
};

/** Customer can cancel while the booking hasn't been accepted or served yet. */
function isCancellable(b: Booking): boolean {
  return (b.status === 'pending' || b.status === 'paid') && b.service_date >= new Date().toISOString().slice(0, 10);
}

export default function MyBookingsScreen({ navigation }: Props) {
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setBookings(await listMyBookings());
    } catch (e) {
      Alert.alert(t('auth.errorTitle'), (e as Error).message);
    }
  }, [t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));

    // Live status updates: refetch when the admin accepts/rejects a booking.
    const channel = supabase
      .channel('my-bookings')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        () => void load()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const confirmCancel = (booking: Booking) => {
    Alert.alert(t('bookings.cancelTitle'), t('bookings.cancelBody'), [
      { text: t('bookings.cancelNo'), style: 'cancel' },
      {
        text: t('bookings.cancelYes'),
        style: 'destructive',
        onPress: () => {
          void cancelBooking(booking.id)
            .then(load)
            .catch((e) => Alert.alert(t('auth.errorTitle'), (e as Error).message));
        },
      },
    ]);
  };

  const prettyDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });

  const renderItem = ({ item }: { item: Booking }) => {
    const statusColor = STATUS_COLORS[item.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>
            {t(`service.${item.option}` as TranslationKey)}
          </Text>
          <View style={[styles.statusChip, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.fg }]}>
              {t(`status.${item.status}`)}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {prettyDate(item.service_date)} · {item.time_slot}
          </Text>
        </View>
        {item.square_meters ? (
          <View style={styles.metaRow}>
            <Ionicons name="resize-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {item.square_meters} m²
              {item.extra_hours > 0 ? ` · +${item.extra_hours} ${t('unit.hours')}` : ''}
            </Text>
          </View>
        ) : null}
        {(item.supplies?.length ?? 0) > 0 ? (
          <View style={styles.metaRow}>
            <Ionicons name="cube-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {t('bookings.supplies')} ·{' '}
              {item.supplies
                .map((s) => `${s.quantity}× ${locale === 'el' ? s.name_el : s.name_en}`)
                .join(', ')}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardBottom}>
          <Text style={styles.amount}>{formatEuros(item.amount_cents)}</Text>
          {isCancellable(item) ? (
            <PressableScale
              onPress={() => confirmCancel(item)}
              hitSlop={8}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>{t('bookings.cancel')}</Text>
            </PressableScale>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <SubpageHeader
        title={t('bookings.title')}
        onBack={() => navigation.goBack()}
        topInset={insets.top}
      />
      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={44} color={colors.border} />
              <Text style={styles.emptyTitle}>{t('bookings.empty')}</Text>
              <Text style={styles.emptyHint}>{t('bookings.emptyHint')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.screen,
    gap: 12,
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    borderRadius: radii.row,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
    backgroundColor: colors.background,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  statusChip: {
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  amount: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  cancelBtn: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: '#E5484D',
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  cancelText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#E5484D',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  emptyHint: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
