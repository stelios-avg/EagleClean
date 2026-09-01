import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, PillButton, Subtitle } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { hourRateCents } from '../../constants/booking';
import {
  allowedExtras,
  extrasForOption,
  bookingGrandTotalCents,
  bookingTotalCents,
  extrasTotalCents,
  formatEuros,
  SERVICE_FEE_CENTS,
  suppliesTotalCents,
} from '../../constants/payments';
import { getMyProfile } from '../../services/profile';
import { completeContactFrom } from '../../utils/contact';
import { colors, fonts, radii, spacing } from '../../theme';
import type {
  BookingExtraId,
  BookingSelection,
  BookingStackParamList,
  BookingSupply,
  RootStackParamList,
} from '../../navigation/types';

const EXTRA_ICONS: Record<BookingExtraId, keyof typeof Ionicons.glyphMap> = {
  ironing: 'shirt-outline',
  hoover: 'disc-outline',
  oven: 'restaurant-outline',
  fireplace: 'flame-outline',
};

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

function supplyName(item: BookingSupply, language: string) {
  const name = language === 'el' ? item.nameEl : item.nameEn;
  return item.variantLabel ? `${name} · ${item.variantLabel}` : name;
}

/**
 * Review the quote, optionally add marketplace supplies, then continue.
 */
export default function BookingSummaryScreen({ navigation, route }: Props) {
  const { isAuthenticated, session } = useAuth();
  const { t, locale, language } = useI18n();
  const [checking, setChecking] = useState(false);
  const [extraIds, setExtraIds] = useState<BookingExtraId[]>(
    () => route.params.extras ?? []
  );
  const { date, timeSlot, category, option, rooms, squareMeters, extraHours, supplies, pieces } =
    route.params;
  const cleaningAmount = bookingTotalCents(option, extraHours, squareMeters, rooms, pieces);
  const suppliesAmount = suppliesTotalCents(supplies ?? []);
  const extrasAmount = extrasTotalCents(allowedExtras(option, extraIds));
  const amount = bookingGrandTotalCents(
    option,
    extraHours,
    squareMeters,
    rooms,
    supplies ?? [],
    pieces,
    extraIds
  );
  const choseSupplies = supplies !== undefined;

  const withExtras = (nextSupplies: BookingSupply[]): BookingSelection => ({
    ...route.params,
    supplies: nextSupplies,
    extras: allowedExtras(option, extraIds),
  });

  const goNext = async (nextSupplies: BookingSupply[]) => {
    const params = withExtras(nextSupplies);
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

  const toggleExtra = (id: BookingExtraId) => {
    setExtraIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const extraChoices = extrasForOption(option);
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
            value={
              option === 'Ironing'
                ? t('services.ironing')
                : category === 'my-home'
                  ? t('services.myHome')
                  : t('services.crew')
            }
          />
          <SummaryRow
            icon="options-outline"
            label={t('summary.option')}
            value={t(`service.${option}`).replace(/\n/g, '')}
          />
          {option !== 'Events' && option !== 'Ironing' ? (
            <SummaryRow
              icon="bed-outline"
              label={t('summary.rooms')}
              value={
                rooms === 0 ? t('service.Studio').replace(/\n/g, '') : String(rooms)
              }
            />
          ) : null}
          <SummaryRow icon="calendar-outline" label={t('summary.day')} value={prettyDate} />
          <SummaryRow
            icon="time-outline"
            label={t('summary.time')}
            value={extraHours > 0 ? `${timeSlot} (+${extraHours})` : timeSlot}
          />
          {option === 'Ironing' ? (
            <SummaryRow
              icon="shirt-outline"
              label={t('quote.pieces')}
              value={t('quote.piecesValue', { n: String(pieces ?? 0) })}
            />
          ) : (
            <SummaryRow
              icon="resize-outline"
              label={t('summary.sqm')}
              value={`${squareMeters} m²`}
            />
          )}
          {extraHours > 0 ? (
            <SummaryRow
              icon="add-circle-outline"
              label={t('summary.extraHours')}
              value={`${extraHours} × ${formatEuros(hourRateCents(option))}`}
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
                    {item.quantity}× {supplyName(item, language)}
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

        {extraChoices.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.suppliesTitle}>{t('summary.extrasTitle')}</Text>
            <Text style={styles.suppliesHint}>
              {t(option === 'Deep Cleaning' ? 'summary.extrasHintDeep' : 'summary.extrasHint')}
            </Text>
            {extraChoices.map((item) => {
              const on = extraIds.includes(item.id);
              return (
                <PressableScale
                  key={item.id}
                  onPress={() => toggleExtra(item.id)}
                  style={[styles.extraRow, on && styles.extraRowOn]}
                >
                  <View style={[styles.rowIcon, on && styles.extraIconOn]}>
                    <Ionicons
                      name={EXTRA_ICONS[item.id]}
                      size={18}
                      color={on ? colors.textOnAccent : colors.accentDeep}
                    />
                  </View>
                  <Text style={styles.extraName}>
                    {language === 'el' ? item.nameEl : item.nameEn}
                  </Text>
                  <Text style={styles.supplyPrice}>{formatEuros(item.priceCents)}</Text>
                  <Ionicons
                    name={on ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={on ? colors.accentDeep : colors.border}
                  />
                </PressableScale>
              );
            })}
            {extrasAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.subtotalLabel}>{t('summary.extras')}</Text>
                <Text style={styles.subtotalValue}>{formatEuros(extrasAmount)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.subtotalLabel}>{t('summary.serviceFee')}</Text>
            <Text style={styles.subtotalValue}>{formatEuros(SERVICE_FEE_CENTS)}</Text>
          </View>
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
              onPress={() =>
                navigation.navigate('BookingSupplies', {
                  ...route.params,
                  extras: allowedExtras(option, extraIds),
                })
              }
              disabled={checking}
            />
          </>
        ) : (
          <>
            <PillButton
              label={t('summary.addSupplies')}
              onPress={() =>
                navigation.navigate('BookingSupplies', {
                  ...route.params,
                  extras: allowedExtras(option, extraIds),
                })
              }
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
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.row,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  extraRowOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  extraIconOn: {
    backgroundColor: colors.accent,
  },
  extraName: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
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
