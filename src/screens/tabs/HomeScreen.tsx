import React from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
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
import { BrandLogo, ImageCard, LanguageToggle } from '../../components/ui';
import { SERVICE_PRICES, formatEuros } from '../../constants/payments';
import { useI18n } from '../../i18n/LanguageContext';
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
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onAction} hitSlop={8}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const startBooking = () => navigation.navigate('BookingFlow');

  const bookService = (option: ServiceOption) =>
    navigation.navigate('BookingFlow', {
      screen: 'Calendar',
      params: { preselected: option },
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
          <Text style={styles.tagline}>{t('home.tagline')}</Text>

          {/* Search-style booking CTA */}
          <Pressable
            onPress={startBooking}
            style={({ pressed }) => [styles.searchBar, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.searchText}>{t('home.searchCta')}</Text>
            <View style={styles.searchButton}>
              <Ionicons name="arrow-forward" size={20} color={colors.textOnDark} />
            </View>
          </Pressable>
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
          <Pressable key={option} onPress={() => bookService(option)} style={styles.category}>
            <View style={styles.categoryCircle}>
              <Image source={icon} style={styles.categoryIcon} resizeMode="contain" />
            </View>
            <Text style={styles.categoryLabel} numberOfLines={2}>
              {t(`service.${option}`)}
            </Text>
          </Pressable>
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
          <Pressable
            key={option}
            onPress={() => bookService(option)}
            style={({ pressed }) => [styles.featuredCard, pressed && { opacity: 0.92 }]}
          >
            <View style={styles.featuredImageWrap}>
              <Image source={image} style={styles.featuredImage} resizeMode="cover" />
              <View style={styles.pricePill}>
                <Text style={styles.priceText}>{formatEuros(SERVICE_PRICES[option])}</Text>
              </View>
            </View>
            <Text style={styles.featuredTitle}>{t(`service.${option}`)}</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }, (_, i) => (
                <Ionicons key={i} name="star-outline" size={14} color={colors.tabInactive} />
              ))}
            </View>
          </Pressable>
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
    fontSize: 21,
    fontFamily: fonts.extraBold,
    textAlign: 'center',
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
    fontSize: 19,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
  },
  sectionAction: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  categoriesRow: {
    paddingHorizontal: spacing.screen,
    gap: 16,
  },
  category: {
    alignItems: 'center',
    width: 96,
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
    height: 32,
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
    color: colors.textOnDark,
    fontSize: 14,
    fontFamily: fonts.extraBold,
  },
  featuredTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginTop: 10,
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
});
