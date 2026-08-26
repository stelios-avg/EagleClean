import React, { useMemo, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo, PillButton } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { BASE_DURATION_HOURS } from '../../constants/booking';
import {
  INCLUDED_SQM,
  SERVICE_PRICES,
  formatEuros,
  indicativePriceCents,
} from '../../constants/payments';
import { useI18n } from '../../i18n/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';
import {
  CREW_SERVICES,
  HOME_SIZES,
  categoryFor,
  homeSizeFromRooms,
  isHomeSize,
  roomsFromOption,
  type BookingStackParamList,
  type CrewService,
  type HomeSize,
} from '../../navigation/types';
import { colors, fonts, radii, spacing } from '../../theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'Quote'>;

const ALL_OPTIONS: (HomeSize | CrewService)[] = [...HOME_SIZES, ...CREW_SERVICES];
const SQM_PRESETS = [40, 60, 80, 100, 120, 150];

const DESC_KEY: Record<HomeSize | CrewService, TranslationKey> = {
  Studio: 'quote.desc.Studio',
  '1 Bedroom': 'quote.desc.1 Bedroom',
  '2 Bedroom': 'quote.desc.2 Bedroom',
  '3 Bedroom': 'quote.desc.3 Bedroom',
  'Deep Cleaning': 'quote.desc.Deep Cleaning',
  Events: 'quote.desc.Events',
};

function serviceLabel(raw: string): string {
  return raw.replace(/\n/g, '');
}

function heroFor(option?: HomeSize | CrewService): ImageSourcePropType {
  return option === 'Events'
    ? require('../../../assets/images/service-crew.png')
    : require('../../../assets/images/service-home.png');
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
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </PressableScale>
  );
}

export default function QuoteScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const incoming = route.params?.option;
  const serviceLocked = incoming != null;

  const [option, setOption] = useState<HomeSize | CrewService | undefined>(incoming);
  const [rooms, setRooms] = useState(() => (incoming ? roomsFromOption(incoming) : 2));
  const [sqm, setSqm] = useState('');
  const [customSqm, setCustomSqm] = useState(false);
  const [sqmError, setSqmError] = useState(false);

  const squareMeters = parseInt(sqm, 10);
  const sqmValid = Number.isFinite(squareMeters) && squareMeters > 0;
  const homeService = option ? isHomeSize(option) : true;
  const roomChoices = homeService ? [0, 1, 2, 3] : [1, 2, 3, 4, 5, 6];
  const duration = option ? BASE_DURATION_HOURS[option] : 2;

  const priceCents = useMemo(() => {
    if (!option) {
      return 0;
    }
    return indicativePriceCents(option, sqmValid ? squareMeters : 0, rooms);
  }, [option, rooms, sqmValid, squareMeters]);

  const pickService = (next: HomeSize | CrewService) => {
    setOption(next);
    setRooms(roomsFromOption(next));
  };

  const pickRooms = (next: number) => {
    setRooms(next);
    if (option && isHomeSize(option)) {
      setOption(homeSizeFromRooms(next));
    }
  };

  const pickSqm = (value: number) => {
    setCustomSqm(false);
    setSqm(String(value));
    setSqmError(false);
  };

  const handleContinue = () => {
    if (!option) {
      return;
    }
    if (!sqmValid) {
      setSqmError(true);
      return;
    }
    Keyboard.dismiss();
    navigation.navigate('Calendar', {
      option,
      rooms,
      squareMeters,
    });
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.getParent()?.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <Image source={heroFor(option)} style={styles.hero} resizeMode="cover" />
          <PressableScale
            onPress={goBack}
            style={[styles.roundBtn, { top: insets.top + 8 }]}
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </PressableScale>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.category}>
            {option
              ? categoryFor(option) === 'my-home'
                ? t('services.myHome')
                : t('services.crew')
              : t('quote.pickService')}
          </Text>
          <Text style={styles.title}>
            {option ? serviceLabel(t(`service.${option}`)) : t('quote.title')}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {option ? t('quote.from', { price: formatEuros(priceCents) }) : '—'}
            </Text>
            {option && priceCents > SERVICE_PRICES[option] ? (
              <Text style={styles.priceExtra}>
                {t('quote.overage', {
                  price: formatEuros(priceCents - SERVICE_PRICES[option]),
                })}
              </Text>
            ) : null}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('quote.minDuration')}</Text>
            <Text style={styles.metaValue}>
              {t('quote.hoursValue', { n: String(duration) })}
            </Text>
          </View>
          {option ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{t('quote.included')}</Text>
              <Text style={styles.metaValue}>
                {t('quote.includedSqm', { n: String(INCLUDED_SQM[option]) })}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quote.description')}</Text>
          <Text style={styles.body}>
            {option ? t(DESC_KEY[option]) : t('quote.pickServiceHint')}
          </Text>
          <Text style={styles.bodyMuted}>{t('quote.indicativeHint')}</Text>
        </View>

        {!serviceLocked ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('quote.pickService')}</Text>
            <View style={styles.chipWrap}>
              {ALL_OPTIONS.map((item) => (
                <Chip
                  key={item}
                  label={serviceLabel(t(`service.${item}`))}
                  selected={option === item}
                  onPress={() => pickService(item)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quote.rooms')}</Text>
          <View style={styles.chipWrap}>
            {roomChoices.map((count) => (
              <Chip
                key={count}
                label={
                  count === 0 ? t('quote.chipStudio') : t('quote.chipRooms', { n: String(count) })
                }
                selected={option != null && rooms === count}
                disabled={!option}
                onPress={() => pickRooms(count)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quote.sqm')}</Text>
          <View style={styles.chipWrap}>
            {SQM_PRESETS.map((value) => (
              <Chip
                key={value}
                label={`${value} m²`}
                selected={!customSqm && sqm === String(value)}
                disabled={!option}
                onPress={() => pickSqm(value)}
              />
            ))}
            <Chip
              label={t('quote.sqmCustom')}
              selected={customSqm}
              disabled={!option}
              onPress={() => {
                setCustomSqm(true);
                setSqm('');
              }}
            />
          </View>
          {customSqm ? (
            <View style={[styles.sqmInputWrap, sqmError && !sqmValid && styles.sqmInputError]}>
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
          ) : null}
          {sqmError && !sqmValid ? (
            <Text style={styles.errorText}>{t('calendar.sqmError')}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quote.providerTitle')}</Text>
          <View style={styles.providerCard}>
            <BrandLogo height={36} />
            <Text style={styles.providerName}>{t('quote.providerName')}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <PillButton
          label={t('quote.bookNow')}
          onPress={handleContinue}
          disabled={!option}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  heroWrap: {
    height: 250,
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
  summaryCard: {
    marginTop: -36,
    marginHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 20,
    gap: 8,
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
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    lineHeight: 30,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.accent,
  },
  priceExtra: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.success,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  metaLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.accent,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 22,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  bodyMuted: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.accent,
  },
  chipLabelSelected: {
    color: colors.textOnAccent,
    fontFamily: fonts.bold,
  },
  sqmInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  sqmInputError: {
    borderColor: '#E5484D',
  },
  sqmInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  sqmUnit: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#E5484D',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    padding: 12,
  },
  providerName: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
