import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Subtitle } from '../../components/ui';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, radii, spacing } from '../../theme';
import type { BookingStackParamList, HomeSize } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'Calendar'>;

const HOME_SIZES: HomeSize[] = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom'];

/** Mock availability: 1-hour intervals, 08:00-18:00. Phase 2 fetches real slots from Supabase. */
const SLOTS = Array.from({ length: 10 }, (_, i) => {
  const start = String(8 + i).padStart(2, '0');
  const end = String(9 + i).padStart(2, '0');
  return `${start}:00 - ${end}:00`;
});

/** Local (not UTC) YYYY-MM-DD, so days don't shift across timezones. */
function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Month grid cells, Monday-first, padded with nulls to full weeks. */
function getMonthGrid(year: number, month: number): (Date | null)[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export default function CalendarScreen({ navigation, route }: Props) {
  const { t, locale } = useI18n();
  const preselected = route.params?.preselected;

  const continueWithSlot = (date: string, timeSlot: string) => {
    if (preselected) {
      // Category was already chosen on the Home screen — skip ServiceSelection.
      navigation.navigate('BookingSummary', {
        date,
        timeSlot,
        category: (HOME_SIZES as string[]).includes(preselected)
          ? 'my-home'
          : 'cleaning-crew',
        option: preselected,
      });
      return;
    }
    navigation.navigate('ServiceSelection', { date, timeSlot });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Bookings start from tomorrow.
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);

  const [monthCursor, setMonthCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState<Date | null>(null);

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const atCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const weekdayLabels = useMemo(() => {
    // 2024-01-01 is a Monday.
    return Array.from({ length: 7 }, (_, i) =>
      new Date(2024, 0, 1 + i)
        .toLocaleDateString(locale, { weekday: 'short' })
        .replace('.', '')
    );
  }, [locale]);

  const monthTitle = monthCursor.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const changeMonth = (delta: number) => {
    setMonthCursor(new Date(year, month + delta, 1));
  };

  const selectedPretty = selected?.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Heading>{t('calendar.title')}</Heading>
      <Subtitle>{t('calendar.step')}</Subtitle>
      {preselected ? (
        <View style={styles.preselectedChip}>
          <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
          <Text style={styles.preselectedLabel}>{t(`service.${preselected}`)}</Text>
        </View>
      ) : null}

      <View style={styles.calendarCard}>
        {/* Month header */}
        <View style={styles.monthHeader}>
          <Pressable
            onPress={() => changeMonth(-1)}
            disabled={atCurrentMonth}
            hitSlop={10}
            style={[styles.monthArrow, atCurrentMonth && { opacity: 0.25 }]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.monthTitle}>{monthTitle}</Text>
          <Pressable onPress={() => changeMonth(1)} hitSlop={10} style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Weekday labels */}
        <View style={styles.weekRow}>
          {weekdayLabels.map((label) => (
            <Text key={label} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* Day grid */}
        <View style={styles.grid}>
          {grid.map((day, i) => {
            if (!day) {
              return <View key={`empty-${i}`} style={styles.dayCell} />;
            }
            const disabled = day < minDate;
            const isSelected =
              !!selected && toISODate(day) === toISODate(selected);
            const isToday = toISODate(day) === toISODate(today);
            return (
              <View key={toISODate(day)} style={styles.dayCell}>
                <Pressable
                  disabled={disabled}
                  onPress={() => setSelected(day)}
                  style={[
                    styles.dayCircle,
                    isToday && !isSelected && styles.dayToday,
                    isSelected && styles.daySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      disabled && styles.dayDisabled,
                      isSelected && styles.dayLabelSelected,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      {/* Time slots for the selected day */}
      {selected ? (
        <View style={styles.slotsSection}>
          <Text style={styles.slotsTitle}>{t('calendar.slotsFor')}</Text>
          <Text style={styles.slotsDate}>{selectedPretty}</Text>
          <View style={styles.slotsGrid}>
            {SLOTS.map((slot) => (
              <Pressable
                key={slot}
                onPress={() => continueWithSlot(toISODate(selected), slot)}
                style={({ pressed }) => [
                  styles.slotChip,
                  pressed && { backgroundColor: colors.surface },
                ]}
              >
                <Text style={styles.slotLabel}>{slot}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.hintRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.hintText}>{t('calendar.pickDayHint')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    gap: 8,
    paddingBottom: 40,
  },
  preselectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  preselectedLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  calendarCard: {
    marginTop: 10,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 17,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  daySelected: {
    backgroundColor: colors.accent,
  },
  dayLabel: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  dayLabelSelected: {
    color: colors.textOnDark,
    fontFamily: fonts.extraBold,
  },
  dayDisabled: {
    color: colors.border,
  },
  slotsSection: {
    marginTop: 14,
    gap: 4,
  },
  slotsTitle: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  slotsDate: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    width: '48%',
    paddingVertical: 14,
    borderRadius: radii.row,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  slotLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 14,
    borderRadius: radii.row,
    backgroundColor: colors.surface,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});
