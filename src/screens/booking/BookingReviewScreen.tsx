import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SubpageHeader } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { cleanerForBooking } from '../../constants/team';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { asBookingOption, type RootStackParamList } from '../../navigation/types';
import {
  getBookingReview,
  getMyBooking,
  submitBookingReview,
} from '../../services/bookings';
import { colors, fonts, radii, spacing } from '../../theme';
import type { BookingReview } from '../../types/database';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingReview'>;

const TIP_PRESETS = [0, 2, 5, 10] as const;
type TipChoice = (typeof TIP_PRESETS)[number] | 'other';

export default function BookingReviewScreen({ navigation, route }: Props) {
  const { t, language } = useI18n();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { bookingId } = route.params;
  const cleaner = cleanerForBooking(bookingId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sameCleaner, setSameCleaner] = useState(true);
  const [tipChoice, setTipChoice] = useState<TipChoice>(0);
  const [customTip, setCustomTip] = useState('');
  const [existing, setExisting] = useState<BookingReview | null>(null);
  const [option, setOption] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [review, booking] = await Promise.all([
          getBookingReview(bookingId),
          getMyBooking(bookingId).catch(() => null),
        ]);
        if (!alive) {
          return;
        }
        if (booking) {
          setOption(booking.option);
        }
        if (review) {
          setExisting(review);
          setRating(review.rating);
          setComment(review.comment ?? '');
          setSameCleaner(review.want_same_cleaner);
          const euros = review.tip_cents / 100;
          if ((TIP_PRESETS as readonly number[]).includes(euros)) {
            setTipChoice(euros as (typeof TIP_PRESETS)[number]);
          } else if (review.tip_cents > 0) {
            setTipChoice('other');
            setCustomTip(String(euros));
          }
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [bookingId]);

  const tipCents = useMemo(() => {
    if (tipChoice !== 'other') {
      return tipChoice * 100;
    }
    const euros = Number(customTip.replace(',', '.').trim());
    if (!Number.isFinite(euros) || euros < 0) {
      return null;
    }
    return Math.round(euros * 100);
  }, [customTip, tipChoice]);

  const goHome = () =>
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });

  const bookAgain = () => {
    const parsed = option ? asBookingOption(option) : undefined;
    navigation.navigate('BookingFlow', parsed ? { screen: 'Quote', params: { option: parsed } } : undefined);
  };

  const onSubmit = () => {
    if (existing) {
      return;
    }
    if (!isAuthenticated) {
      Alert.alert(t('review.needLoginTitle'), t('review.needLoginBody'), [
        { text: t('bookings.cancelNo'), style: 'cancel' },
        { text: t('auth.login'), onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }
    if (rating < 1) {
      Alert.alert(t('auth.errorTitle'), t('review.needRating'));
      return;
    }
    if (tipCents == null || tipCents > 100000) {
      Alert.alert(t('auth.errorTitle'), t('review.tipInvalid'));
      return;
    }

    setSaving(true);
    void submitBookingReview({
      bookingId,
      rating,
      comment,
      wantSameCleaner: sameCleaner,
      tipCents,
    })
      .then(() => {
        Alert.alert(t('review.submittedTitle'), t('review.submittedBody'), [
          { text: 'OK', onPress: goHome },
        ]);
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : String(e);
        Alert.alert(
          t('auth.errorTitle'),
          message.includes('duplicate') || message.includes('23505')
            ? t('review.already')
            : message
        );
      })
      .finally(() => setSaving(false));
  };

  const locked = existing != null;

  return (
    <View style={styles.root}>
      <SubpageHeader
        title={t('review.title')}
        onBack={() => (navigation.canGoBack() ? navigation.goBack() : goHome())}
        topInset={insets.top}
      />
      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>{t('review.subtitle')}</Text>
            <Text style={styles.cleanerHint}>
              {language === 'el' ? cleaner.nameEl : cleaner.nameEn}
            </Text>

            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <PressableScale
                  key={i}
                  onPress={() => !locked && setRating(i)}
                  disabled={locked}
                  hitSlop={6}
                  accessibilityLabel={`${i}`}
                >
                  <Ionicons
                    name={rating >= i ? 'star' : 'star-outline'}
                    size={40}
                    color={colors.accent}
                  />
                </PressableScale>
              ))}
            </View>

            {locked ? <Text style={styles.already}>{t('review.already')}</Text> : null}

            <Text style={styles.label}>{t('review.comment')}</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t('review.commentPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              editable={!locked}
              multiline
              textAlignVertical="top"
              style={styles.comment}
            />

            <Text style={styles.label}>{t('review.sameCleaner')}</Text>
            <View style={styles.choiceRow}>
              <ChoiceChip
                label={t('review.sameYes')}
                selected={sameCleaner}
                onPress={() => !locked && setSameCleaner(true)}
              />
              <ChoiceChip
                label={t('review.sameNo')}
                selected={!sameCleaner}
                onPress={() => !locked && setSameCleaner(false)}
              />
            </View>

            <Text style={styles.label}>{t('review.tip')}</Text>
            <View style={styles.tipRow}>
              {TIP_PRESETS.map((amount) => (
                <ChoiceChip
                  key={amount}
                  label={`${amount}€`}
                  selected={tipChoice === amount}
                  onPress={() => {
                    if (!locked) {
                      setTipChoice(amount);
                    }
                  }}
                />
              ))}
              <ChoiceChip
                label={t('review.tipOther')}
                selected={tipChoice === 'other'}
                onPress={() => !locked && setTipChoice('other')}
              />
            </View>
            {tipChoice === 'other' ? (
              <TextInput
                value={customTip}
                onChangeText={setCustomTip}
                placeholder={t('review.tipCustom')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                editable={!locked}
                style={styles.customTip}
              />
            ) : null}

            {!locked ? (
              <PressableScale
                onPress={onSubmit}
                disabled={saving}
                style={[styles.primaryBtn, saving && { opacity: 0.55 }]}
              >
                <LinearGradient
                  colors={[colors.accentStart, colors.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                {saving ? (
                  <ActivityIndicator color={colors.textOnAccent} />
                ) : (
                  <Text style={styles.primaryLabel}>{t('review.submit')}</Text>
                )}
              </PressableScale>
            ) : null}

            <PressableScale onPress={bookAgain} style={styles.outlineBtn}>
              <Ionicons name="calendar-outline" size={18} color={colors.accentDeep} />
              <Text style={styles.outlineLabel}>{t('review.bookAgain')}</Text>
            </PressableScale>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.96}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    gap: 12,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  cleanerHint: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginTop: -6,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  already: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.accentDeep,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginTop: 8,
  },
  comment: {
    minHeight: 96,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.row,
    padding: 14,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexGrow: 1,
    minWidth: 64,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  chipLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  chipLabelSelected: {
    color: colors.textOnAccent,
  },
  customTip: {
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.row,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  primaryBtn: {
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 10,
  },
  primaryLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textOnAccent,
  },
  outlineBtn: {
    height: 54,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  outlineLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.accentDeep,
  },
});
