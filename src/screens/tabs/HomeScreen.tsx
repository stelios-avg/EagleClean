import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo, LanguageToggle } from '../../components/ui';
import { BounceEmoji } from '../../components/BounceEmoji';
import { PressableScale } from '../../components/PressableScale';
import {
  DEEP_HOUR_RATE_CENTS,
  EVENTS_HOUR_RATE_CENTS,
  HOUR_RATE_CENTS,
} from '../../constants/booking';
import { IRONING_FIRST_PACK_CENTS, IRONING_PACK_SIZE } from '../../constants/payments';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';
import { getMyProfile } from '../../services/profile';
import { colors, fonts, radii, shadows, spacing } from '../../theme';
import type {
  BookingOption,
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

type ServiceCard = {
  option: BookingOption;
  titleKey: TranslationKey;
  image: ImageSourcePropType;
  rate: string;
};

function euroPlain(cents: number): string {
  return cents % 100 === 0 ? `€${cents / 100}` : `€${(cents / 100).toFixed(2)}`;
}

function greetingKey(): TranslationKey {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'home.greetMorning';
  }
  if (hour < 18) {
    return 'home.greetAfternoon';
  }
  return 'home.greetEvening';
}

function firstNameFrom(fullName?: string | null): string | null {
  const name = fullName?.trim().split(/\s+/)[0];
  return name ? name : null;
}

export default function HomeScreen({ navigation }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        setFirstName(null);
        return;
      }
      let active = true;
      getMyProfile()
        .then((profile) => {
          if (active) {
            setFirstName(firstNameFrom(profile.full_name));
          }
        })
        .catch(() => {
          if (active) {
            setFirstName(null);
          }
        });
      return () => {
        active = false;
      };
    }, [isAuthenticated])
  );

  const hello = firstName
    ? t('home.helloName', { greeting: t(greetingKey()), name: firstName })
    : t('home.hello', { greeting: t(greetingKey()) });

  const services = useMemo<ServiceCard[]>(
    () => [
      {
        option: 'Studio',
        titleKey: 'home.regular',
        image: require('../../../assets/images/service-home.png'),
        rate: t('home.perHour', { price: euroPlain(HOUR_RATE_CENTS) }),
      },
      {
        option: 'Deep Cleaning',
        titleKey: 'service.Deep Cleaning',
        image: require('../../../assets/images/hero-welcome.png'),
        rate: t('home.perHour', { price: euroPlain(DEEP_HOUR_RATE_CENTS) }),
      },
      {
        option: 'Events',
        titleKey: 'service.Events',
        image: require('../../../assets/images/service-crew.png'),
        rate: t('home.perHour', { price: euroPlain(EVENTS_HOUR_RATE_CENTS) }),
      },
      {
        option: 'Ironing',
        titleKey: 'service.Ironing',
        image: require('../../../assets/images/service-ironing.jpg'),
        rate: t('home.fromPack', {
          price: euroPlain(IRONING_FIRST_PACK_CENTS),
          count: String(IRONING_PACK_SIZE),
        }),
      },
    ],
    [t]
  );

  const bookService = (option: BookingOption) =>
    navigation.navigate('BookingFlow', {
      screen: 'Quote',
      params: { option },
    });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <BrandLogo height={58} chip={false} />
        <View style={[styles.langCorner, { top: insets.top + 12 }]}>
          <LanguageToggle />
        </View>
      </View>

      <View style={styles.intro}>
        <Text style={styles.hello} maxFontSizeMultiplier={1.15}>
          {hello}
        </Text>
        <Text style={styles.headline} maxFontSizeMultiplier={1.12}>
          {t('home.headline')}
        </Text>
      </View>

      <View style={styles.searchBlock}>
        <Text style={styles.searchLabel}>{t('home.searchLabel')}</Text>
        <PressableScale
          onPress={() => navigation.navigate('BookingFlow')}
          style={styles.searchBar}
          accessibilityLabel={t('home.searchCta')}
        >
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.searchText}>{t('home.searchCta')}</Text>
          <View style={styles.searchPin}>
            <Ionicons name="calendar-outline" size={18} color={colors.accentDeep} />
          </View>
        </PressableScale>
      </View>

      <Text style={styles.sectionTitle}>{t('home.services')}</Text>
      <View style={styles.serviceGrid}>
        {services.map((service) => (
          <PressableScale
            key={service.option}
            onPress={() => bookService(service.option)}
            style={styles.serviceCard}
            accessibilityLabel={`${t(service.titleKey)}, ${service.rate}`}
          >
            <Text style={styles.serviceTitle} numberOfLines={2}>
              {t(service.titleKey).replace(/\n/g, ' ')}
            </Text>
            <Text style={styles.serviceRate}>{service.rate}</Text>
            <Image source={service.image} style={styles.serviceImage} resizeMode="cover" />
            <View style={styles.serviceArrow}>
              <Ionicons name="arrow-forward" size={16} color={colors.textOnDark} />
            </View>
          </PressableScale>
        ))}
      </View>

      <PressableScale
        onPress={() => navigation.navigate('Marketplace')}
        style={styles.marketCard}
        accessibilityLabel={t('home.marketTitle')}
      >
        <View style={styles.marketCopy}>
          <Text style={styles.marketTitle}>{t('home.marketTitle')}</Text>
          <Text style={styles.marketHint}>{t('home.marketHint')}</Text>
        </View>
        <Image
          source={require('../../../assets/images/marketplace-products.png')}
          style={styles.marketImage}
          resizeMode="cover"
        />
      </PressableScale>

      <Text style={[styles.sectionTitle, styles.howTitle]}>{t('home.howTitle')}</Text>
      <View style={styles.howGrid}>
        {(
          [
            {
              emoji: '📅',
              title: 'home.how1Title' as const,
              body: 'home.how1Body' as const,
              onPress: () => navigation.navigate('Plans'),
            },
            {
              emoji: '✏️',
              title: 'home.how2Title' as const,
              body: 'home.how2Body' as const,
            },
            {
              emoji: '👩',
              title: 'home.how3Title' as const,
              body: 'home.how3Body' as const,
            },
            {
              emoji: '✨',
              title: 'home.how4Title' as const,
              body: 'home.how4Body' as const,
            },
          ]
        ).map((step, index) => {
          const inner = (
            <>
              <View style={styles.howIcon}>
                <BounceEmoji emoji={step.emoji} delay={index * 140} size={26} />
              </View>
              <Text style={styles.howCardTitle}>{t(step.title)}</Text>
              <Text style={styles.howCardBody}>{t(step.body)}</Text>
            </>
          );
          if ('onPress' in step && step.onPress) {
            return (
              <PressableScale key={step.title} onPress={step.onPress} style={styles.howCard}>
                {inner}
              </PressableScale>
            );
          }
          return (
            <View key={step.title} style={styles.howCard}>
              {inner}
            </View>
          );
        })}
      </View>

      <View style={styles.trustRow}>
        <View style={styles.trustCard}>
          <View style={styles.trustIcon}>
            <Ionicons name="shield-checkmark" size={22} color={colors.accentDeep} />
          </View>
          <Text style={styles.trustTitle}>{t('home.trustTitle')}</Text>
          <Text style={styles.trustBody}>{t('home.trustBody')}</Text>
        </View>
        <View style={styles.trustCard}>
          <View style={styles.trustIcon}>
            <Ionicons name="headset" size={22} color={colors.accentDeep} />
          </View>
          <Text style={styles.trustTitle}>{t('home.supportTitle')}</Text>
          <Text style={styles.trustBody}>{t('home.supportBody')}</Text>
        </View>
      </View>
    </ScrollView>
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
  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    marginBottom: 22,
  },
  langCorner: {
    position: 'absolute',
    right: 0,
    top: 8,
  },
  intro: {
    gap: 8,
    marginBottom: 22,
  },
  hello: {
    fontSize: 28,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  headline: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  searchBlock: {
    gap: 8,
    marginBottom: 28,
  },
  searchLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    minHeight: 58,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  searchPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 18,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 14,
    minHeight: 236,
    overflow: 'hidden',
    ...shadows.card,
  },
  serviceTitle: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    lineHeight: 21,
  },
  serviceRate: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 10,
  },
  serviceImage: {
    width: '100%',
    height: 122,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  serviceArrow: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.card,
    overflow: 'hidden',
    minHeight: 148,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 22,
  },
  marketCopy: {
    flex: 1,
    paddingVertical: 22,
    paddingRight: 12,
    gap: 6,
  },
  marketTitle: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  marketHint: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  marketImage: {
    width: 132,
    height: 148,
  },
  howTitle: {
    marginTop: 28,
  },
  howGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 14,
  },
  howCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 16,
    gap: 8,
    minHeight: 168,
  },
  howIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howCardTitle: {
    fontSize: 15,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  howCardBody: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  trustCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    gap: 8,
  },
  trustIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustTitle: {
    fontSize: 14,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  trustBody: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
