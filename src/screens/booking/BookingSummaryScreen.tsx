import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, PillButton, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { EXTRA_HOUR_PRICE_CENTS } from '../../constants/booking';
import {
  bookingGrandTotalCents,
  bookingTotalCents,
  formatEuros,
  suppliesTotalCents,
} from '../../constants/payments';
import { getMyProfile } from '../../services/profile';
import { completeContactFrom } from '../../utils/contact';
import { colors, fonts, radii, spacing } from '../../theme';
import type {
  BookingSelection,
  BookingStackParamList,
  BookingSupply,
  RootStackParamList,
} from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingSummary'>;

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={19} color={colors.accent} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function supplyName(item: BookingSupply, locale: string) {
  const name = locale === 'el' ? item.nameEl : item.nameEn;
  return item.variantLabel ? `${name} · ${item.variantLabel}` : name;
}

/**
 * Review the quote, optionally add marketplace supplies, then continue.
 */
export default function BookingSummaryScreen({ navigation, route }: Props) {
  const { isAuthenticated, session } = useAuth();
  const { t, locale } = useI18n();
  const [checking, setChecking] = useState(false);
  const { date, timeSlot, category, option, rooms, squareMeters, extraHours, supplies } =
    route.params;
  const cleaningAmount = bookingTotalCents(option, extraHours, squareMeters, rooms);
  const suppliesAmount = suppliesTotalCents(supplies ?? []);
  const amount = bookingGrandTotalCents(option, extraHours, squareMeters, rooms, supplies ?? []);
  const choseSupplies = supplies !== undefined;

  const goNext = async (nextSupplies: BookingSupply[]) => {
    const params: BookingSelection = { ...route.params, supplies: nextSupplies };
    if (!isAuthenticated) {
      navigation.navigate('ContactDetails', params);
      return;
    }
    setChecking(true);
    let contact: ReturnType<typeof completeContactFrom> = null;
    try {
      const profile = await getMyProfile();
      contact = completeContactFrom(
        profile.full_name,
        profile.email ?? session?.email,
        profile.phone,
        profile.address,
        profile.address_lat,
        profile.address_lng
      );
    } catch {
      // Profile unavailable — fall back to asking for details.
    }
    setChecking(false);
    if (contact) {
      navigation.navigate('Payment', { ...params, contact });
    } else {
      navigation.navigate('ContactDetails', params);
    }
  };

  const prettyDate = new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const rootNavigation =
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Heading>{t('summary.title')}</Heading>
        <Subtitle>{t('summary.subtitle')}</Subtitle>

        <View style={styles.card}>
          <SummaryRow
            icon="briefcase-outline"
            label={t('summary.service')}
            value={category === 'my-home' ? t('services.myHome') : t('services.crew')}
          />
          <SummaryRow
            icon="options-outline"
            label={t('summary.option')}
            value={t(`service.${option}`).replace(/\n/g, '')}
          />
          <SummaryRow
            icon="bed-outline"
            label={t('summary.rooms')}
            value={
              rooms === 0 ? t('service.Studio').replace(/\n/g, '') : String(rooms)
            }
          />
          <SummaryRow icon="calendar-outline" label={t('summary.day')} value={prettyDate} />
          <SummaryRow
            icon="time-outline"
            label={t('summary.time')}
            value={extraHours > 0 ? `${timeSlot} (+${extraHours})` : timeSlot}
          />
          <SummaryRow
            icon="resize-outline"
            label={t('summary.sqm')}
            value={`${squareMeters} m²`}
          />
          {extraHours > 0 ? (
            <SummaryRow
              icon="add-circle-outline"
              label={t('summary.extraHours')}
              value={`${extraHours} × ${formatEuros(EXTRA_HOUR_PRICE_CENTS)}`}
            />
          ) : null}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.subtotalLabel}>{t('summary.cleaning')}</Text>
            <Text style={styles.subtotalValue}>{formatEuros(cleaningAmount)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.suppliesTitle}>{t('summary.suppliesTitle')}</Text>
          {choseSupplies && (supplies?.length ?? 0) > 0 ? (
            <>
              {supplies!.map((item) => (
                <View key={item.productId} style={styles.supplyRow}>
                  <Text style={styles.supplyName} numberOfLines={2}>
                    {item.quantity}× {supplyName(item, locale)}
                  </Text>
                  <Text style={styles.supplyPrice}>
                    {formatEuros(item.unitPriceCents * item.quantity)}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.subtotalLabel}>{t('summary.supplies')}</Text>
                <Text style={styles.subtotalValue}>{formatEuros(suppliesAmount)}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.suppliesHint}>
              {choseSupplies ? t('summary.suppliesNone') : t('summary.suppliesHint')}
            </Text>
          )}
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>{t('summary.total')}</Text>
          <Text style={styles.totalValue}>{formatEuros(amount)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {choseSupplies ? (
          <>
            <PillButton
              label={checking ? t('auth.pleaseWait') : t('summary.continue')}
              onPress={() => void goNext(supplies ?? [])}
              disabled={checking}
            />
            <PillButton
              label={t('summary.changeSupplies')}
              variant="outline"
              onPress={() => navigation.navigate('BookingSupplies', route.params)}
              disabled={checking}
            />
          </>
        ) : (
          <>
            <PillButton
              label={t('summary.addSupplies')}
              onPress={() => navigation.navigate('BookingSupplies', route.params)}
              disabled={checking}
            />
            <PillButton
              label={checking ? t('auth.pleaseWait') : t('summary.withoutSupplies')}
              variant="outline"
              onPress={() => void goNext([])}
              disabled={checking}
            />
          </>
        )}
        {!isAuthenticated ? (
          <PillButton
            label={t('summary.orLogin')}
            variant="outline"
            onPress={() => rootNavigation?.navigate('Auth')}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.screen,
    paddingBottom: 16,
    gap: 8,
  },
  card: {
    marginTop: 10,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  subtotalValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  suppliesTitle: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  suppliesHint: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  supplyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  supplyName: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  supplyPrice: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  totalCard: {
    marginTop: 10,
    borderRadius: radii.card,
    backgroundColor: colors.ink,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textOnDark,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.textOnDark,
  },
  footer: {
    gap: 10,
    paddingHorizontal: spacing.screen,
    paddingBottom: 16,
    paddingTop: 8,
  },
});
