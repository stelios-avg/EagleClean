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
import { PillButton } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { BASE_DURATION_HOURS } from '../../constants/booking';
import {
  INCLUDED_SQM,
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
  isIroning,
  roomsFromOption,
  type BookingOption,
  type BookingStackParamList,
} from '../../navigation/types';
import { colors, fonts, spacing } from '../../theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'Quote'>;

const ALL_OPTIONS: BookingOption[] = [...HOME_SIZES, ...CREW_SERVICES, 'Ironing'];
const SQM_PRESETS = [40, 60, 80, 100, 120, 150];
const PIECE_PRESETS = [10, 20, 30, 40, 50];
const INCLUDE_BULLETS: TranslationKey[] = [
  'quote.bulletBroom',
  'quote.bulletMop',
  'quote.bulletSurfaces',
];
const EVENTS_BULLETS: TranslationKey[] = [
  'quote.bulletToilet',
  'quote.bulletTrash',
];
const DEEP_BULLETS: TranslationKey[] = [
  'quote.bulletHoover',
  'quote.bulletAluminum',
  'quote.bulletWindows',
  'quote.bulletCupboards',
  'quote.bulletFridge',
];
const IRONING_BULLETS: TranslationKey[] = [
  'quote.bulletClothes',
  'quote.bulletSteam',
];
const TEAM_PHOTOS: ImageSourcePropType[] = [
  require('../../../assets/images/team/cleaner-1.png'),
  require('../../../assets/images/team/cleaner-2.png'),
  require('../../../assets/images/team/cleaner-3.png'),
  require('../../../assets/images/team/cleaner-4.png'),
];
const TEAM_RATINGS = [5, 5, 4.5, 5];
const TEAM_RATING = 4.9;

const DESC_KEY: Record<BookingOption, TranslationKey> = {
  Studio: 'quote.desc.Studio',
  '1 Bedroom': 'quote.desc.1 Bedroom',
  '2 Bedroom': 'quote.desc.2 Bedroom',
  '3 Bedroom': 'quote.desc.3 Bedroom',
  'Deep Cleaning': 'quote.desc.Deep Cleaning',
  Events: 'quote.desc.Events',
  Ironing: 'quote.desc.Ironing',
};

function serviceLabel(raw: string): string {
  return raw.replace(/\n/g, '');
}

function heroFor(option?: BookingOption): ImageSourcePropType {
  if (option === 'Events') {
    return require('../../../assets/images/service-crew.png');
  }
  if (option === 'Ironing') {
    return require('../../../assets/images/service-ironing.jpg');
  }
  return require('../../../assets/images/service-home.png');
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starRow} accessibilityLabel={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const icon =
          rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline';
        return (
          <Ionicons key={i} name={icon} size={size} color={colors.accent} />
        );
      })}
    </View>
  );
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

  const [option, setOption] = useState<BookingOption | undefined>(incoming);
  const [rooms, setRooms] = useState(() =>
    incoming === 'Events' || incoming === 'Ironing' ? 0 : incoming ? roomsFromOption(incoming) : 2
  );
  const [sqm, setSqm] = useState('');
  const [customSqm, setCustomSqm] = useState(false);
  const [sqmError, setSqmError] = useState(false);
  const [piecesText, setPiecesText] = useState('');
  const [customPieces, setCustomPieces] = useState(false);
  const [piecesError, setPiecesError] = useState(false);

  const squareMeters = parseInt(sqm, 10);
  const sqmValid = Number.isFinite(squareMeters) && squareMeters > 0;
  const pieces = parseInt(piecesText, 10);
  const piecesValid = Number.isFinite(pieces) && pieces > 0;
  const homeService = option ? isHomeSize(option) : true;
  const isEvents = option === 'Events';
  const ironing = option != null && isIroning(option);
  const roomChoices = homeService ? [0, 1, 2, 3] : [1, 2, 3, 4, 5, 6];
  const duration = option ? BASE_DURATION_HOURS[option] : 2;
  const isDeep = option === 'Deep Cleaning';
  const includeBullets = ironing
    ? IRONING_BULLETS
    : isEvents
      ? EVENTS_BULLETS
      : isDeep
        ? DEEP_BULLETS
        : INCLUDE_BULLETS;

  const priceCents = useMemo(() => {
    if (!option) {
      return 0;
    }
    return indicativePriceCents(
      option,
      sqmValid ? squareMeters : 0,
      rooms,
      piecesValid ? pieces : undefined
    );
  }, [option, rooms, sqmValid, squareMeters, piecesValid, pieces]);

  const pickService = (next: BookingOption) => {
    setOption(next);
    setRooms(next === 'Events' || next === 'Ironing' ? 0 : roomsFromOption(next));
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

  const pickPieces = (value: number) => {
    setCustomPieces(false);
    setPiecesText(String(value));
    setPiecesError(false);
  };

  const handleContinue = () => {
    if (!option) {
      return;
    }
    if (ironing) {
      if (!piecesValid) {
        setPiecesError(true);
        return;
      }
      Keyboard.dismiss();
      navigation.navigate('Calendar', {
        option,
        rooms: 0,
        squareMeters: 0,
        pieces,
      });
      return;
    }
    if (!sqmValid) {
      setSqmError(true);
      return;
    }
    Keyboard.dismiss();
    navigation.navigate('Calendar', {
      option,
      rooms: option === 'Events' ? 0 : rooms,
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
              ? ironing
                ? t('services.ironing')
                : categoryFor(option) === 'my-home'
                  ? t('services.myHome')
                  : t('services.crew')
              : t('quote.pickService')}
          </Text>
          <Text style={styles.title}>
            {option ? serviceLabel(t(`service.${option}`)) : t('quote.title')}
          </Text>
          <View style={styles.summaryRating}>
            <StarRow rating={TEAM_RATING} size={14} />
            <Text style={styles.summaryRatingText}>{TEAM_RATING.toFixed(1)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {option ? t('quote.from', { price: formatEuros(priceCents) }) : '—'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('quote.minDuration')}</Text>
            <Text style={styles.metaValue}>
              {t('quote.hoursValue', { n: String(duration) })}
            </Text>
          </View>
          {option && !ironing ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{t('quote.included')}</Text>
              <Text style={styles.metaValue}>
                {t('quote.includedSqm', { n: String(INCLUDED_SQM) })}
              </Text>
            </View>
          ) : null}
          {ironing ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{t('quote.pieces')}</Text>
              <Text style={styles.metaValue}>
                {piecesValid
                  ? t('quote.piecesValue', { n: String(pieces) })
                  : t('quote.piecesPack')}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quote.description')}</Text>
          <Text style={styles.body}>
            {option ? t(DESC_KEY[option]) : t('quote.pickServiceHint')}
          </Text>
          <View style={styles.bulletList}>
            {includeBullets.map((key) => (
              <View key={key} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{t(key)}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.bodyMuted}>
            {t(
              ironing
                ? 'quote.indicativeHintIroning'
                : isEvents
                  ? 'quote.indicativeHintEvents'
                  : isDeep
                    ? 'quote.indicativeHintDeep'
                    : 'quote.indicativeHint'
            )}
          </Text>
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

        {!isEvents && !ironing ? (
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
        ) : null}

        {!ironing ? (
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
        ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quote.pieces')}</Text>
          <View style={styles.chipWrap}>
            {PIECE_PRESETS.map((value) => (
              <Chip
                key={value}
                label={t('quote.piecesValue', { n: String(value) })}
                selected={!customPieces && piecesText === String(value)}
                onPress={() => pickPieces(value)}
              />
            ))}
            <Chip
              label={t('quote.sqmCustom')}
              selected={customPieces}
              onPress={() => {
                setCustomPieces(true);
                setPiecesText('');
                setPiecesError(false);
              }}
            />
          </View>
          {customPieces ? (
            <View
              style={[styles.sqmInputWrap, piecesError && !piecesValid && styles.sqmInputError]}
            >
              <TextInput
                value={piecesText}
                onChangeText={(v) => {
                  setPiecesText(v.replace(/[^0-9]/g, ''));
                  setPiecesError(false);
                }}
                placeholder={t('quote.piecesPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={4}
                style={styles.sqmInput}
              />
              <Text style={styles.sqmUnit}>{t('quote.piecesUnit')}</Text>
            </View>
          ) : null}
          {piecesError && !piecesValid ? (
            <Text style={styles.errorText}>{t('quote.piecesError')}</Text>
          ) : null}
        </View>
        )}

        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamRow}
          >
            {TEAM_PHOTOS.map((source, index) => (
              <View key={index} style={styles.teamCard}>
                <Image source={source} style={styles.teamPhoto} />
                <StarRow rating={TEAM_RATINGS[index] ?? 5} size={12} />
              </View>
            ))}
          </ScrollView>
          <View style={styles.reviewRow}>
            <StarRow rating={TEAM_RATING} size={22} />
            <Text style={styles.ratingNumber}>{TEAM_RATING.toFixed(1)}</Text>
          </View>
          <StarRow rating={5} size={22} />
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
  summaryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryRatingText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.accent,
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
  bulletList: {
    gap: 8,
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  bulletText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
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
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  teamRow: {
    gap: 12,
    paddingRight: 8,
  },
  teamCard: {
    alignItems: 'center',
    gap: 8,
  },
  teamPhoto: {
    width: 108,
    height: 108,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingNumber: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
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
