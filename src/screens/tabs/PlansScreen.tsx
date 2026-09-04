import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BounceEmoji } from '../../components/BounceEmoji';
import { BrandLogo } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import {
  findMonthlyPlan,
  PLAN_FREQUENCIES,
  PLAN_VISIT_HOURS,
  type PlanFrequency,
  type PlanVisitHours,
} from '../../constants/plans';
import { useI18n } from '../../i18n/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';
import { colors, fonts, radii, shadows, spacing } from '../../theme';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Plans'>,
  NativeStackScreenProps<RootStackParamList>
>;

const FREQ_EMOJI: Record<PlanFrequency, string> = {
  1: '📅',
  2: '📆',
  3: '🗓️',
};

const FREQ_KEY: Record<PlanFrequency, TranslationKey> = {
  1: 'plans.freq1',
  2: 'plans.freq2',
  3: 'plans.freq3',
};

const HOUR_EMOJI: Record<PlanVisitHours, string> = {
  2: '🏠',
  3: '✨',
  4: '💎',
};

const PERKS: { emoji: string; key: TranslationKey }[] = [
  { emoji: '📅', key: 'plans.perkSchedule' },
  { emoji: '👩', key: 'plans.perkCleaner' },
  { emoji: '⚡', key: 'plans.perkPriority' },
  { emoji: '🔄', key: 'plans.perkChange' },
];

export default function PlansScreen({ navigation }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [frequency, setFrequency] = useState<PlanFrequency>(1);
  const [visitHours, setVisitHours] = useState<PlanVisitHours>(3);

  const selected = useMemo(
    () => findMonthlyPlan(frequency, visitHours),
    [frequency, visitHours]
  );

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <BrandLogo height={42} chip={false} />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('plans.pageTitle')}</Text>
          <BounceEmoji emoji="✨" size={26} />
        </View>
        <Text style={styles.subtitle}>{t('plans.pageSubtitle')}</Text>

        <Text style={styles.step}>{t('plans.stepFrequency')}</Text>
        <View style={styles.freqRow}>
          {PLAN_FREQUENCIES.map((freq, index) => {
            const active = frequency === freq;
            return (
              <PressableScale
                key={freq}
                onPress={() => setFrequency(freq)}
                style={[styles.freqCard, active && styles.freqCardOn]}
              >
                <BounceEmoji emoji={FREQ_EMOJI[freq]} delay={index * 120} size={24} />
                <Text style={[styles.freqLabel, active && styles.freqLabelOn]}>
                  {t(FREQ_KEY[freq])}
                </Text>
                {active ? (
                  <View style={styles.check}>
                    <Ionicons name="checkmark" size={12} color={colors.textOnAccent} />
                  </View>
                ) : null}
              </PressableScale>
            );
          })}
        </View>

        <Text style={styles.step}>{t('plans.stepDuration')}</Text>
        <View style={styles.durationRow}>
          {PLAN_VISIT_HOURS.map((hours, index) => {
            const plan = findMonthlyPlan(frequency, hours);
            const active = visitHours === hours;
            return (
              <PressableScale
                key={hours}
                onPress={() => setVisitHours(hours)}
                style={[styles.planCard, active && styles.planCardOn]}
              >
                {hours === 3 ? (
                  <View style={styles.popular}>
                    <Text style={styles.popularText}>{t('plans.mostPopular')}</Text>
                  </View>
                ) : null}
                {plan.bestValue ? (
                  <View style={styles.best}>
                    <Text style={styles.bestText}>{t('plans.bestValue')}</Text>
                  </View>
                ) : null}
                <BounceEmoji emoji={HOUR_EMOJI[hours]} delay={180 + index * 140} size={26} />
                <Text style={styles.hoursVisit}>
                  {t('plans.hoursVisit', { hours: String(hours) })}
                </Text>
                <Text style={styles.hoursMonth}>
                  {t('plans.hoursMonth', { hours: String(plan.hoursPerMonth) })}
                </Text>
                <Text style={styles.was}>€{plan.wasEuros}</Text>
                <Text style={styles.price}>
                  €{plan.priceEuros}
                  <Text style={styles.priceUnit}>{t('plans.perMonthShort')}</Text>
                </Text>
                <View style={styles.savePill}>
                  <Text style={styles.saveText}>
                    {t('plans.saving', { amount: `€${plan.saveEuros}` })}
                  </Text>
                </View>
                <Text style={styles.hourly}>
                  {t('plans.perHour', { price: `€${plan.perHour.toFixed(2)}` })}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        <View style={styles.perks}>
          {PERKS.map((perk, index) => (
            <View key={perk.key} style={styles.perk}>
              <BounceEmoji emoji={perk.emoji} delay={80 * index} size={18} />
              <Text style={styles.perkText}>{t(perk.key)}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.extras}>{t('plans.extrasNote')}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 10 }]}>
        <PressableScale
          onPress={() =>
            navigation.navigate('BookingFlow', {
              screen: 'Quote',
              params: { option: 'Studio' },
            })
          }
          style={styles.cta}
          accessibilityLabel={`${t('plans.continue')} €${selected.priceEuros}`}
        >
          <Text style={styles.ctaText}>
            {t('plans.continue')} · €{selected.priceEuros}
            {t('plans.perMonthShort')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.textOnAccent} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flexShrink: 1,
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 22,
  },
  step: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  freqRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  freqCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  freqCardOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  freqLabel: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  freqLabelOn: {
    color: colors.textPrimary,
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 236,
    ...shadows.card,
  },
  planCardOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  popular: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 2,
  },
  popularText: {
    fontSize: 9,
    fontFamily: fonts.extraBold,
    color: colors.textOnAccent,
  },
  best: {
    backgroundColor: '#F5C84C',
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  bestText: {
    fontSize: 9,
    fontFamily: fonts.extraBold,
    color: colors.ink,
  },
  hoursVisit: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 4,
  },
  hoursMonth: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  was: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.tabInactive,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  price: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  priceUnit: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  savePill: {
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  saveText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.accentDeep,
  },
  hourly: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  perks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12,
  },
  perk: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  perkText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  extras: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    minHeight: 56,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    color: colors.textOnAccent,
    fontSize: 16,
    fontFamily: fonts.extraBold,
  },
});
