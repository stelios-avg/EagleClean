import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Heading, ListRow, PillButton, ScreenContainer, Subtitle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, spacing } from '../../theme';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AccountScreen({ navigation }: Props) {
  const { session, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return (
      <ScreenContainer style={styles.guestContainer}>
        <View style={styles.guestIcon}>
          <Ionicons name="person-circle-outline" size={72} color={colors.accent} />
        </View>
        <Heading>Your account</Heading>
        <Subtitle>
          Log in to see your bookings, orders and your EagleClean membership.
        </Subtitle>
        <View style={{ height: 8 }} />
        <PillButton label="Login / Sign Up" onPress={() => navigation.navigate('Auth')} />
      </ScreenContainer>
    );
  }

  const purchaseMembership = () => {
    // Phase 3: Stripe Billing recurring subscription (EUR 14.99/month).
    Alert.alert('Membership', 'Stripe subscription checkout arrives in Phase 3.');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Heading>Account</Heading>

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {session?.email.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.profileName}>Welcome back</Text>
          <Text style={styles.profileEmail}>{session?.email}</Text>
        </View>
      </View>

      {/* Membership card */}
      <View style={styles.membershipCard}>
        <View style={styles.membershipHeader}>
          <Ionicons name="sparkles" size={18} color={colors.textOnDark} />
          <Text style={styles.membershipBrand}>EagleClean Membership</Text>
        </View>
        <Text style={styles.membershipPrice}>
          €14.99<Text style={styles.membershipPeriod}> /month</Text>
        </Text>
        <Text style={styles.membershipPerks}>
          Priority slots, member pricing and free product delivery.
        </Text>
        <PillButton label="Become a member" variant="light" onPress={purchaseMembership} />
      </View>

      <ListRow
        icon="receipt-outline"
        label="Order history"
        sublabel="Bookings and marketplace orders"
        onPress={() => Alert.alert('Orders', 'Order history arrives with Supabase in Phase 2.')}
      />
      <ListRow icon="log-out-outline" label="Sign out" onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    gap: 14,
  },
  guestContainer: {
    justifyContent: 'center',
  },
  guestIcon: {
    alignItems: 'flex-start',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textOnDark,
    fontSize: 22,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  membershipCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.card,
    padding: 24,
    gap: 10,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  membershipBrand: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: '700',
  },
  membershipPrice: {
    color: colors.textOnDark,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  membershipPeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnDarkMuted,
  },
  membershipPerks: {
    color: colors.textOnDarkMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});
