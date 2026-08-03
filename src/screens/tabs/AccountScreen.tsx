import React from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo, LanguageToggle, PillButton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, radii, spacing } from '../../theme';
import type { TranslationKey } from '../../i18n/translations';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

const MEMBERSHIP_PERKS: TranslationKey[] = [
  'account.perk1',
  'account.perk2',
  'account.perk3',
  'account.perk4',
  'account.perk5',
  'account.perk6',
];

const GUEST_HIGHLIGHTS: {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}[] = [
  {
    icon: 'calendar-outline',
    titleKey: 'account.highlightBookings',
    bodyKey: 'account.highlightBookingsBody',
  },
  {
    icon: 'diamond-outline',
    titleKey: 'account.highlightMember',
    bodyKey: 'account.highlightMemberBody',
  },
  {
    icon: 'bag-handle-outline',
    titleKey: 'account.highlightOrders',
    bodyKey: 'account.highlightOrdersBody',
  },
];

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

function MenuRow({
  icon,
  label,
  sublabel,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: colors.surface }]}
    >
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#E5484D' : colors.accent}
        />
      </View>
      <View style={styles.menuCopy}>
        <Text style={[styles.menuLabel, danger && { color: '#E5484D' }]}>{label}</Text>
        {sublabel ? <Text style={styles.menuSub}>{sublabel}</Text> : null}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={danger ? '#E5484D' : colors.textSecondary}
      />
    </Pressable>
  );
}

export default function AccountScreen({ navigation }: Props) {
  const { session, isAuthenticated, signOut } = useAuth();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.guestContent, { paddingBottom: 28 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require('../../../assets/images/auth-hero.png')}
          style={[styles.guestHero, { paddingTop: insets.top + 16 }]}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(11,12,16,0.4)', 'rgba(11,12,16,0.55)', 'rgba(11,12,16,0.78)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.guestHeroTop}>
            <BrandLogo height={40} />
            <LanguageToggle onDark />
          </View>
          <View style={styles.guestHeroCopy}>
            <Text style={styles.guestEyebrow}>{t('account.title')}</Text>
            <Text style={styles.guestTitle}>{t('account.guestTitle')}</Text>
            <Text style={styles.guestSubtitle}>{t('account.guestSubtitle')}</Text>
          </View>
        </ImageBackground>

        <View style={styles.guestSheet}>
          <PillButton
            label={t('welcome.loginSignup')}
            onPress={() => navigation.navigate('Auth')}
          />

          <Text style={styles.sectionLabel}>{t('account.whyJoin')}</Text>
          <View style={styles.highlightList}>
            {GUEST_HIGHLIGHTS.map((item) => (
              <View key={item.titleKey} style={styles.highlightRow}>
                <View style={styles.highlightIcon}>
                  <Ionicons name={item.icon} size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.highlightTitle}>{t(item.titleKey)}</Text>
                  <Text style={styles.highlightBody}>{t(item.bodyKey)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  const purchaseMembership = () => {
    Alert.alert(t('account.membership'), t('account.membershipSoon'));
  };

  const initial = session?.email.slice(0, 1).toUpperCase() ?? '?';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileCard, { marginTop: insets.top + 8 }]}>
        <LinearGradient
          colors={[colors.ink, '#1A2A8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileHello}>{t('account.welcomeBack')}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {session?.email}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{t('account.membership')}</Text>
      <View style={styles.membershipCard}>
        <LinearGradient
          colors={[colors.ink, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.membershipHeader}>
          <View style={styles.membershipBadge}>
            <Ionicons name="sparkles" size={14} color={colors.accent} />
            <Text style={styles.membershipBrand}>{t('account.membership')}</Text>
          </View>
          <Text style={styles.membershipPrice}>
            €14.99
            <Text style={styles.membershipPeriod}>{t('account.perMonth')}</Text>
          </Text>
        </View>
        <View style={styles.perksList}>
          {MEMBERSHIP_PERKS.map((key) => (
            <View key={key} style={styles.perkRow}>
              <Ionicons name="checkmark-circle" size={18} color="#7CFFB2" />
              <Text style={styles.perkText}>{t(key)}</Text>
            </View>
          ))}
        </View>
        <PillButton
          label={t('account.become')}
          variant="light"
          onPress={purchaseMembership}
        />
      </View>

      <Text style={styles.sectionLabel}>{t('account.sectionActivity')}</Text>
      <View style={styles.menuCard}>
        <MenuRow
          icon="receipt-outline"
          label={t('account.orders')}
          sublabel={t('account.ordersSub')}
          onPress={() => Alert.alert(t('account.orders'), t('account.ordersSoon'))}
        />
      </View>

      <Text style={styles.sectionLabel}>{t('account.sectionSettings')}</Text>
      <View style={styles.menuCard}>
        <View style={styles.langRow}>
          <View style={styles.menuIcon}>
            <Ionicons name="globe-outline" size={20} color={colors.accent} />
          </View>
          <Text style={[styles.menuLabel, { flex: 1 }]}>{t('account.language')}</Text>
          <LanguageToggle />
        </View>
        <View style={styles.menuDivider} />
        <MenuRow
          icon="log-out-outline"
          label={t('account.signOut')}
          danger
          onPress={() => {
            void signOut().catch((e) =>
              Alert.alert(t('auth.errorTitle'), (e as Error).message)
            );
          }}
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
    paddingHorizontal: spacing.screen,
    gap: 12,
  },
  guestContent: {
    flexGrow: 1,
  },
  guestHero: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 36,
    minHeight: 300,
    justifyContent: 'space-between',
  },
  guestHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestHeroCopy: {
    gap: 8,
  },
  guestEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  guestTitle: {
    color: colors.textOnDark,
    fontSize: 34,
    fontFamily: fonts.extraBold,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  guestSubtitle: {
    color: colors.textOnDarkMuted,
    fontSize: 15,
    fontFamily: fonts.medium,
    lineHeight: 22,
    maxWidth: 340,
  },
  guestSheet: {
    marginTop: -24,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: spacing.screen,
    paddingTop: 22,
    gap: 18,
    flexGrow: 1,
  },
  sectionLabel: {
    marginTop: 6,
    marginBottom: -2,
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  highlightList: {
    gap: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    padding: 16,
  },
  highlightIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  highlightBody: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  profileCard: {
    borderRadius: radii.card,
    overflow: 'hidden',
    padding: 20,
    minHeight: 110,
    justifyContent: 'center',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textOnDark,
    fontSize: 24,
    fontFamily: fonts.extraBold,
  },
  profileHello: {
    color: colors.textOnDark,
    fontSize: 20,
    fontFamily: fonts.extraBold,
    letterSpacing: -0.3,
  },
  profileEmail: {
    marginTop: 3,
    color: colors.textOnDarkMuted,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  membershipCard: {
    borderRadius: radii.card,
    overflow: 'hidden',
    padding: 22,
    gap: 12,
  },
  membershipHeader: {
    gap: 8,
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  membershipBrand: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  membershipPrice: {
    color: colors.textOnDark,
    fontSize: 36,
    fontFamily: fonts.extraBold,
    letterSpacing: -0.5,
  },
  membershipPeriod: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textOnDarkMuted,
  },
  perksList: {
    gap: 8,
    marginBottom: 4,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  perkText: {
    flex: 1,
    color: colors.textOnDarkMuted,
    fontSize: 14,
    fontFamily: fonts.medium,
    lineHeight: 19,
  },
  menuCard: {
    borderRadius: radii.row,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: 'rgba(229,72,77,0.1)',
  },
  menuCopy: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  menuSub: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 68,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});
