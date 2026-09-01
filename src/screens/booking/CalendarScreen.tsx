import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PillButton } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import {
  ALL_DAY_DURATION_HOURS,
  BASE_DURATION_HOURS,
  DAY_START_HOUR,
  allDayExtraHours,
  getSlotStartHours,
  isAllDayTaken,
  isSlotStartPassed,
  isSlotTaken,
  maxExtraHoursWithBookings,
  slotLabel,
  type BookedRange,
} from '../../constants/booking';
import { getClosedSlots } from '../../services/bookings';
import { checkServiceArea, type ServiceAreaStatus } from '../../services/serviceArea';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/LanguageContext';
import { categoryFor } from '../../navigation/types';
import { colors, fonts, radii, spacing } from '../../theme';
import type { BookingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'Calendar'>;

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

function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.96}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
      ]}
    >
      <Text
        style={[
          styles.chipLabel,
          selected && styles.chipLabelSelected,
          disabled && styles.chipLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

export default function CalendarScreen({ navigation, route }: Props) {
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const { option, rooms, squareMeters } = route.params;

  const duration = BASE_DURATION_HOURS[option];
  const slotStartHours = useMemo(() => getSlotStartHours(duration), [duration]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today;

  const [monthCursor, setMonthCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [allDay, setAllDay] = useState(false);
  const [extraHours, setExtraHours] = useState(0);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [areaStatus, setAreaStatus] = useState<ServiceAreaStatus | 'checking'>(
    'checking'
  );
  const runAreaCheck = useCallback(() => {
    setAreaStatus('checking');
    checkServiceArea().then(setAreaStatus);
  }, []);
  useEffect(() => {
    runAreaCheck();
  }, [runAreaCheck]);

  useEffect(() => {
    if (!selected) {
      return;
    }
    let stale = false;
    setLoadingSlots(true);
    getClosedSlots(toISODate(selected))
      .then((ranges) => {
        if (!stale) {
          setBookedRanges(ranges);
        }
      })
      .catch(() => {
        if (!stale) {
          setBookedRanges([]);
        }
      })
      .finally(() => {
        if (!stale) {
          setLoadingSlots(false);
        }
      });
    return () => {
      stale = true;
    };
  }, [selected]);

  useEffect(() => {
    if (!selected) {
      return;
    }
    const iso = toISODate(selected);
    const channel = supabase
      .channel(`closed-slots-${iso}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'closed_slots', filter: `service_date=eq.${iso}` },
        () => {
          void getClosedSlots(iso).then(setBookedRanges).catch(() => {});
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selected]);

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const atCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const weekdayLabels = useMemo(() => {
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
    setAllDay(false);
    setExtraHours(0);
    setBookedRanges([]);
  };

  const pickSlot = (hour: number) => {
    setAllDay(false);
    setStartHour(hour);
    setExtraHours(0);
  };

  const pickAllDay = () => {
    setAllDay(true);
    setStartHour(DAY_START_HOUR);
    setExtraHours(allDayExtraHours(duration));
  };

  const selectedPretty = selected?.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const maxExtra =
    startHour !== null && !allDay
      ? maxExtraHoursWithBookings(startHour, duration, bookedRanges)
      : 0;
  useEffect(() => {
    if (allDay) {
      return;
    }
    setExtraHours((v) => Math.min(v, maxExtra));
  }, [maxExtra, allDay]);

  const totalHours = allDay ? ALL_DAY_DURATION_HOURS : duration + extraHours;
  const selectedIso = selected ? toISODate(selected) : null;
  const allSlotsTaken =
    !loadingSlots &&
    slotStartHours.every(
      (hour) =>
        isSlotTaken(hour, duration, bookedRanges) ||
        (selectedIso != null && isSlotStartPassed(selectedIso, hour))
    );

  const allDayTaken =
    selectedIso != null && isAllDayTaken(selectedIso, bookedRanges);
  const nothingAvailable = allSlotsTaken && allDayTaken;

  const handleContinue = () => {
    if (!selected || startHour === null) {
      return;
    }
    if (isSlotStartPassed(toISODate(selected), startHour)) {
      setStartHour(null);
      setAllDay(false);
      return;
    }
    const hours = allDay ? ALL_DAY_DURATION_HOURS : duration + extraHours;
    navigation.navigate('BookingSummary', {
      date: toISODate(selected),
      timeSlot: slotLabel(startHour, hours),
      category: categoryFor(option),
      option,
      rooms,
      squareMeters,
      extraHours: allDay ? allDayExtraHours(duration) : extraHours,
    });
  };

  const extraChoices = Array.from({ length: maxExtra + 1 }, (_, i) => i);
  const hero =
    option === 'Events'
      ? require('../../../assets/images/service-crew.png')
      : require('../../../assets/images/service-home.png');

  if (areaStatus !== 'inside') {
    return (
      <View style={[styles.root, styles.areaCenter, { paddingTop: insets.top }]}>
        <PressableScale
          onPress={() => navigation.goBack()}
          style={[styles.roundBtn, styles.roundBtnStatic]}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </PressableScale>
        {areaStatus === 'checking' ? (
          <>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.areaBody}>{t('area.checking')}</Text>
          </>
        ) : (
          <>
            <View style={styles.areaIcon}>
              <Ionicons
                name={
                  areaStatus === 'outside'
                    ? 'location-outline'
                    : 'navigate-circle-outline'
                }
                size={36}
                color={colors.accent}
              />
            </View>
            <Text style={styles.areaTitle}>
              {areaStatus === 'outside'
                ? t('area.outsideTitle')
                : areaStatus === 'permission-denied'
                  ? t('area.deniedTitle')
                  : t('area.unavailableTitle')}
            </Text>
            <Text style={styles.areaBody}>
              {areaStatus === 'outside'
                ? t('area.outsideBody')
                : areaStatus === 'permission-denied'
                  ? t('area.deniedBody')
                  : t('area.unavailableBody')}
            </Text>
            <View style={styles.areaActions}>
              {areaStatus === 'permission-denied' ? (
                <PillButton
                  label={t('area.openSettings')}
                  onPress={() => Linking.openSettings()}
                />
              ) : null}
              <PillButton label={t('area.retry')} onPress={runAreaCheck} />
            </View>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <Image source={hero} style={styles.hero} resizeMode="cover" />
          <PressableScale
            onPress={() => navigation.goBack()}
            style={[styles.roundBtn, { top: insets.top + 8 }]}
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </PressableScale>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.category}>
            {categoryFor(option) === 'my-home' ? t('services.myHome') : t('services.crew')}
          </Text>
          <Text style={styles.title}>{t(`service.${option}`).replace(/\n/g, '')}</Text>
          <Text style={styles.summaryMeta}>
            {squareMeters} m²
            {rooms > 0 ? ` · ${t('quote.chipRooms', { n: String(rooms) })}` : ` · ${t('quote.chipStudio')}`}
            {` · ${t('quote.hoursValue', { n: String(duration) })}`}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('calendar.pickDate')}</Text>
          <View style={styles.calendarCard}>
            <View style={styles.monthHeader}>
              <PressableScale
                onPress={() => changeMonth(-1)}
                disabled={atCurrentMonth}
                hitSlop={10}
                style={[styles.monthArrow, atCurrentMonth && { opacity: 0.25 }]}
              >
                <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
              </PressableScale>
              <Text style={styles.monthTitle}>{monthTitle}</Text>
              <PressableScale onPress={() => changeMonth(1)} hitSlop={10} style={styles.monthArrow}>
                <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
              </PressableScale>
            </View>

            <View style={styles.weekRow}>
              {weekdayLabels.map((label) => (
                <Text key={label} style={styles.weekdayLabel}>
                  {label}
                </Text>
              ))}
            </View>

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
                    <PressableScale
                      disabled={disabled}
                      onPress={() => pickDay(day)}
                      scaleTo={0.88}
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
                    </PressableScale>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {selected ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('calendar.slotsFor')}</Text>
            <Text style={styles.slotsDate}>{selectedPretty}</Text>
            {loadingSlots ? (
              <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
            ) : nothingAvailable ? (
              <View style={styles.hintRow}>
                <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.hintText}>{t('calendar.noSlots')}</Text>
              </View>
            ) : (
              <View style={styles.chipWrap}>
                {slotStartHours.map((hour) => {
                  const taken =
                    isSlotTaken(hour, duration, bookedRanges) ||
                    isSlotStartPassed(toISODate(selected), hour);
                  return (
                    <Chip
                      key={hour}
                      label={slotLabel(hour, duration)}
                      selected={startHour === hour && !allDay}
                      disabled={taken}
                      onPress={() => pickSlot(hour)}
                    />
                  );
                })}
                <Chip
                  label={t('calendar.allDay')}
                  selected={allDay}
                  disabled={allDayTaken}
                  onPress={pickAllDay}
                />
              </View>
            )}

            {allDay ? (
              <Text style={styles.slotsDate}>
                {slotLabel(DAY_START_HOUR, ALL_DAY_DURATION_HOURS)} · {ALL_DAY_DURATION_HOURS}{' '}
                {t('unit.hours')}
              </Text>
            ) : null}

            {startHour !== null && !allDay ? (
              <View style={{ gap: 10, marginTop: 8 }}>
                <Text style={styles.sectionTitle}>{t('calendar.extraHours')}</Text>
                <Text style={styles.slotsDate}>
                  {slotLabel(startHour, totalHours)} · {totalHours} {t('unit.hours')}
                </Text>
                <View style={styles.chipWrap}>
                  {extraChoices.map((hours) => (
                    <Chip
                      key={hours}
                      label={hours === 0 ? t('calendar.noExtra') : `+${hours}`}
                      selected={extraHours === hours}
                      onPress={() => setExtraHours(hours)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={[styles.section, styles.hintRow]}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.hintText}>{t('calendar.pickDayHint')}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <PillButton
          label={t('calendar.continue')}
          onPress={handleContinue}
          disabled={!selected || startHour === null}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  heroWrap: {
    height: 180,
    backgroundColor: colors.ink,
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  roundBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101218',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  roundBtnStatic: {
    position: 'relative',
    left: 0,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  summaryCard: {
    marginTop: -28,
    marginHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 18,
    gap: 4,
    shadowColor: '#101218',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  category: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.accent,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  summaryMeta: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  calendarCard: {
    borderRadius: 22,
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
    backgroundColor: colors.page,
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
    color: colors.textOnAccent,
    fontFamily: fonts.extraBold,
  },
  dayDisabled: {
    color: colors.border,
  },
  slotsDate: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: -4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  chipDisabled: {
    backgroundColor: colors.surface,
  },
  chipLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.accent,
  },
  chipLabelSelected: {
    color: colors.textOnAccent,
    fontFamily: fonts.bold,
  },
  chipLabelDisabled: {
    color: colors.border,
    textDecorationLine: 'line-through',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: radii.row,
    backgroundColor: colors.background,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  areaCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen * 1.5,
    gap: 12,
  },
  areaIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  areaTitle: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  areaBody: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  areaActions: {
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 10,
  },
});
