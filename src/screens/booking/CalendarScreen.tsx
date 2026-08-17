import React, { useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, PillButton, Subtitle } from '../../components/ui';
import {
  BASE_DURATION_HOURS,
  DEFAULT_DURATION_HOURS,
  getSlotStartHours,
  maxExtraHoursFor,
  slotLabel,
} from '../../constants/booking';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, radii, spacing } from '../../theme';
import type { BookingStackParamList, HomeSize } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'Calendar'>;

const HOME_SIZES: HomeSize[] = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom'];

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

  // Slot length follows the chosen service: 2h regular, 3h deep, 4h events.
  const duration = preselected
    ? BASE_DURATION_HOURS[preselected]
    : DEFAULT_DURATION_HOURS;
  const slotStartHours = useMemo(() => getSlotStartHours(duration), [duration]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Bookings start from tomorrow.
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);

  const [monthCursor, setMonthCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [extraHours, setExtraHours] = useState(0);
  const [sqm, setSqm] = useState('');
  const [sqmError, setSqmError] = useState(false);

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

  const pickDay = (day: Date) => {
    setSelected(day);
    setStartHour(null);
    setExtraHours(0);
  };

  const pickSlot = (hour: number) => {
    setStartHour(hour);
    setExtraHours(0);
  };

  const selectedPretty = selected?.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const maxExtra = startHour !== null ? maxExtraHoursFor(startHour, duration) : 0;
  const totalHours = duration + extraHours;
  const squareMeters = parseInt(sqm, 10);
  const sqmValid = Number.isFinite(squareMeters) && squareMeters > 0;

  const handleContinue = () => {
    if (!selected || startHour === null) {
      return;
    }
    if (!sqmValid) {
      setSqmError(true);
      return;
    }
    Keyboard.dismiss();
    const date = toISODate(selected);
    if (preselected) {
      // Category was already chosen on the Home screen — skip ServiceSelection.
      navigation.navigate('BookingSummary', {
        date,
        timeSlot: slotLabel(startHour, totalHours),
        category: (HOME_SIZES as string[]).includes(preselected)
          ? 'my-home'
          : 'cleaning-crew',
        option: preselected,
        squareMeters,
        extraHours,
      });
      return;
    }
    navigation.navigate('ServiceSelection', {
      date,
      startHour,
      extraHours,
      squareMeters,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Heading>{t('calendar.title')}</Heading>
        <Subtitle>{t('calendar.step')}</Subtitle>
        {preselected ? (
          <View style={styles.preselectedChip}>
            <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
            <Text style={styles.preselectedLabel}>
              {t(`service.${preselected}`)} · {duration}
              {t('unit.hoursShort')}
            </Text>
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
                    onPress={() => pickDay(day)}
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
              {slotStartHours.map((hour) => {
                const active = startHour === hour;
                return (
                  <Pressable
                    key={hour}
                    onPress={() => pickSlot(hour)}
                    style={({ pressed }) => [
                      styles.slotChip,
                      active && styles.slotChipActive,
                      pressed && !active && { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text style={[styles.slotLabel, active && styles.slotLabelActive]}>
                      {slotLabel(hour, duration)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {startHour !== null ? (
              <>
                {/* Extra hours stepper */}
                <View style={styles.optionCard}>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionLabel}>{t('calendar.extraHours')}</Text>
                    <Text style={styles.optionHint}>
                      {slotLabel(startHour, totalHours)} · {totalHours}{' '}
                      {t('unit.hours')}
                    </Text>
                  </View>
                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() => setExtraHours((v) => Math.max(0, v - 1))}
                      disabled={extraHours === 0}
                      style={[styles.stepBtn, extraHours === 0 && styles.stepBtnDisabled]}
                      hitSlop={6}
                    >
                      <Ionicons name="remove" size={20} color={colors.textOnDark} />
                    </Pressable>
                    <Text style={styles.stepValue}>+{extraHours}</Text>
                    <Pressable
                      onPress={() => setExtraHours((v) => Math.min(maxExtra, v + 1))}
                      disabled={extraHours >= maxExtra}
                      style={[styles.stepBtn, extraHours >= maxExtra && styles.stepBtnDisabled]}
                      hitSlop={6}
                    >
                      <Ionicons name="add" size={20} color={colors.textOnDark} />
                    </Pressable>
                  </View>
                </View>

                {/* Mandatory square meters */}
                <View style={styles.optionCard}>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionLabel}>{t('calendar.sqm')}</Text>
                    <Text style={styles.optionHint}>{t('calendar.sqmHint')}</Text>
                  </View>
                  <View
                    style={[styles.sqmInputWrap, sqmError && !sqmValid && styles.sqmInputError]}
                  >
                    <TextInput
                      value={sqm}
                      onChangeText={(v) => {
                        setSqm(v.replace(/[^0-9]/g, ''));
                        setSqmError(false);
                      }}
                      placeholder={t('calendar.sqmPlaceholder')}
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                      maxLength={5}
                      style={styles.sqmInput}
                    />
                    <Text style={styles.sqmUnit}>m²</Text>
                  </View>
                </View>
                {sqmError && !sqmValid ? (
                  <Text style={styles.errorText}>{t('calendar.sqmError')}</Text>
                ) : null}

                <View style={{ height: 6 }} />
                <PillButton label={t('calendar.continue')} onPress={handleContinue} />
              </>
            ) : null}
          </View>
        ) : (
          <View style={styles.hintRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.hintText}>{t('calendar.pickDayHint')}</Text>
          </View>
        )}
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
  slotChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  slotLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  slotLabelActive: {
    color: colors.textOnDark,
  },
  optionCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: radii.row,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  optionHint: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepValue: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  sqmInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    minWidth: 110,
  },
  sqmInputError: {
    borderColor: '#E5484D',
  },
  sqmInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  sqmUnit: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#E5484D',
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
