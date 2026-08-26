import React from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo, ImageCard, LanguageToggle, PillButton } from '../../components/ui';
import { PressableScale } from '../../components/PressableScale';
import { SERVICE_PRICES, formatEuros } from '../../constants/payments';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';
import { colors, fonts, radii, spacing } from '../../theme';
import type {
  CrewService,
  HomeSize,
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

type ServiceOption = HomeSize | CrewService;

const CATEGORIES: { option: ServiceOption; icon: ImageSourcePropType }[] = [
  { option: 'Studio', icon: require('../../../assets/images/icons/cat-studio.png') },
  { option: '1 Bedroom', icon: require('../../../assets/images/icons/cat-1bed.png') },
  { option: '2 Bedroom', icon: require('../../../assets/images/icons/cat-2bed.png') },
  { option: '3 Bedroom', icon: require('../../../assets/images/icons/cat-3bed.png') },
  { option: 'Deep Cleaning', icon: require('../../../assets/images/icons/cat-deep.png') },
  { option: 'Events', icon: require('../../../assets/images/icons/cat-events.png') },
];

const FEATURED: { option: ServiceOption; image: ImageSourcePropType }[] = [
  { option: 'Deep Cleaning', image: require('../../../assets/images/service-home.png') },
  { option: 'Events', image: require('../../../assets/images/service-crew.png') },
  { option: '2 Bedroom', image: require('../../../assets/images/hero-welcome.png') },
];

/** Monthly membership plans, shown to signed-in customers. Stripe checkout arrives in Phase 3. */
const PLANS: {
  id: 'silver' | 'gold' | 'platinum';
  name: string;
  pricePerMonth: number;
  tint: string;
  featureKeys: TranslationKey[];
  popular?: boolean;
}[] = [
  {
    id: 'silver',
    name: 'Silver',
    pricePerMonth: 149,
    tint: '#9BA3B5',
    featureKeys: ['plans.silver.f1', 'plans.silver.f2', 'plans.silver.f3'],
  },
  {
    id: 'gold',
    name: 'Gold',
    pricePerMonth: 279,
    tint: '#D4A017',
    featureKeys: ['plans.gold.f1', 'plans.gold.f2', 'plans.gold.f3'],
    popular: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    pricePerMonth: 499,
    tint: '#8C6A2F',
    featureKeys: [
      'plans.platinum.f1',
      'plans.platinum.f2',
      'plans.platinum.f3',
      'plans.platinum.f4',
    ],
  },
];

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.15}>
        {title}
      </Text>
      <PressableScale onPress={onAction} hitSlop={8}>
        <Text style={styles.sectionAction} maxFontSizeMultiplier={1.1}>
          {actionLabel}
        </Text>
      </PressableScale>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const startBooking = () => navigation.navigate('BookingFlow');

  const selectPlan = (name: string) =>
    // Phase 3: Stripe subscription checkout for the selected plan.
    Alert.alert(name, t('account.membershipSoon'));

  const bookService = (option: ServiceOption) =>
    navigation.navigate('BookingFlow', {
      screen: 'Quote',
      params: { option },
    });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <ImageBackground
        source={require('../../../assets/images/hero-welcome.png')}
        style={styles.heroImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(11,12,16,0.55)', 'rgba(11,12,16,0.35)', 'rgba(11,12,16,0.62)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
          <View style={styles.heroTopRow}>
            <BrandLogo height={52} />
            <View style={styles.langCorner}>
              <LanguageToggle onDark />
            </View>
          </View>
          <Text style={styles.tagline} maxFontSizeMultiplier={1.15}>
            {t('home.tagline')}
          </Text>

          {/* Search-style booking CTA */}
          <PressableScale onPress={startBooking} style={styles.searchBar}>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.searchText}>{t('home.searchCta')}</Text>
            <View style={styles.searchButton}>
              <Ionicons name="arrow-forward" size={20} color={colors.textOnAccent} />
            </View>
          </PressableScale>
        </View>
      </ImageBackground>

      {/* Categories */}
      <SectionHeader
        title={t('home.categories')}
        actionLabel={t('home.viewAll')}
        onAction={startBooking}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {CATEGORIES.map(({ option, icon }) => (
          <PressableScale key={option} onPress={() => bookService(option)} style={styles.category}>
            <View style={styles.categoryCircle}>
              <Image source={icon} style={styles.categoryIcon} resizeMode="contain" />
            </View>
            <Text
              style={styles.categoryLabel}
              numberOfLines={3}
              maxFontSizeMultiplier={1.1}
            >
              {t(`service.${option}`)}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>

      {/* Featured */}
      <SectionHeader
        title={t('home.featured')}
        actionLabel={t('home.viewAll')}
        onAction={startBooking}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredRow}
      >
        {FEATURED.map(({ option, image }) => (
          <PressableScale
            key={option}
            onPress={() => bookService(option)}
            style={styles.featuredCard}
          >
            <View style={styles.featuredImageWrap}>
              <Image source={image} style={styles.featuredImage} resizeMode="cover" />
              <View style={styles.pricePill}>
                <Text style={styles.priceText}>
                  {t('quote.from', { price: formatEuros(SERVICE_PRICES[option]) })}
                </Text>
              </View>
            </View>
            <Text style={styles.featuredTitle} maxFontSizeMultiplier={1.15}>
              {t(`service.${option}`)}
            </Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }, (_, i) => (
                <Ionicons key={i} name="star-outline" size={14} color={colors.tabInactive} />
              ))}
            </View>
          </PressableScale>
        ))}
      </ScrollView>

      {/* Marketplace teaser */}
      <View style={styles.marketSection}>
        <ImageCard
          image={require('../../../assets/images/marketplace-products.png')}
          title={t('home.essentials')}
          linkLabel={t('home.shopLink')}
          height={200}
          onPress={() => navigation.navigate('Marketplace')}
        />
      </View>

      {/* Membership plans — only for signed-in customers */}
      {isAuthenticated && (
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>{t('plans.title')}</Text>
          <Text style={styles.plansSubtitle}>{t('plans.subtitle')}</Text>
          {PLANS.map((plan) => (
            <View
              key={plan.id}
              style={[styles.planCard, plan.popular && styles.planCardPopular]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>{t('plans.popular')}</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <View style={[styles.planDot, { backgroundColor: plan.tint }]} />
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.planPriceWrap}>
                  <Text style={styles.planPrice}>{plan.pricePerMonth}€</Text>
                  <Text style={styles.planPer}>{t('plans.perMonth')}</Text>
                </View>
              </View>
              <View style={styles.planFeatures}>
                {plan.featureKeys.map((key) => (
                  <View key={key} style={styles.planFeatureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={plan.tint} />
                    <Text style={styles.planFeatureText}>{t(key)}</Text>
                  </View>
                ))}
              </View>
              <PillButton
                label={t('plans.select')}
                variant={plan.popular ? 'accent' : 'dark'}
                onPress={() => selectPlan(plan.name)}
              />
            </View>
          ))}
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
    paddingBottom: 26,
  },
  heroImage: {
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
    overflow: 'hidden',
  },
  hero: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 24,
    gap: 14,
  },
  heroTopRow: {
    alignItems: 'center',
  },
  langCorner: {
    position: 'absolute',
    right: 0,
    top: 4,
  },
  tagline: {
    color: colors.textOnDark,
    fontSize: 20,
    fontFamily: fonts.extraBold,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
    borderRadius: radii.row,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    paddingVertical: 10,
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    flexShrink: 1,
    fontSize: 19,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    paddingRight: 8,
    lineHeight: 24,
  },
  sectionAction: {
    flexShrink: 0,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  categoriesRow: {
    paddingHorizontal: spacing.screen,
    gap: 10,
    paddingBottom: 4,
  },
  category: {
    alignItems: 'center',
    width: 118,
  },
  categoryCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 38,
    height: 38,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
    width: '100%',
  },
  featuredRow: {
    paddingHorizontal: spacing.screen,
    gap: 14,
  },
  featuredCard: {
    width: 240,
  },
  featuredImageWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 160,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  pricePill: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  priceText: {
    color: colors.textOnAccent,
    fontSize: 13,
    fontFamily: fonts.extraBold,
  },
  featuredTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginTop: 10,
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  marketSection: {
    paddingHorizontal: spacing.screen,
    marginTop: 22,
  },
  plansSection: {
    paddingHorizontal: spacing.screen,
    marginTop: 28,
    gap: 14,
  },
  plansSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: -6,
    marginBottom: 2,
  },
  planCard: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 22,
    gap: 16,
  },
  planCardPopular: {
    borderColor: colors.accent,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 22,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  popularBadgeText: {
    color: colors.textOnAccent,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  planName: {
    flex: 1,
    fontSize: 20,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  planPriceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  planPer: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  planFeatures: {
    gap: 10,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  planFeatureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
