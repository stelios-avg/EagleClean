import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Heading, ListRow, Subtitle } from '../../components/ui';
import { SERVICE_PRICES, formatEuros } from '../../constants/payments';
import { colors, spacing } from '../../theme';
import type {
  BookingStackParamList,
  CrewService,
  HomeSize,
} from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'ServiceSelection'>;

const HOME_SIZES: { size: HomeSize; icon: 'home-outline' | 'bed-outline' }[] = [
  { size: 'Studio', icon: 'home-outline' },
  { size: '1 Bedroom', icon: 'bed-outline' },
  { size: '2 Bedroom', icon: 'bed-outline' },
  { size: '3 Bedroom', icon: 'bed-outline' },
];

const CREW_SERVICES: { service: CrewService; icon: 'sparkles-outline' | 'people-outline' }[] = [
  { service: 'Deep Cleaning', icon: 'sparkles-outline' },
  { service: 'Events', icon: 'people-outline' },
];

export default function ServiceSelectionScreen({ navigation, route }: Props) {
  const { date, timeSlot } = route.params;

  const selectHome = (option: HomeSize) =>
    navigation.navigate('BookingSummary', { date, timeSlot, category: 'my-home', option });

  const selectCrew = (option: CrewService) =>
    navigation.navigate('BookingSummary', { date, timeSlot, category: 'cleaning-crew', option });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Heading>Choose a service</Heading>
      <Subtitle>Step 3 of 3 — what should we clean?</Subtitle>

      <Text style={styles.sectionTitle}>My Home</Text>
      {HOME_SIZES.map(({ size, icon }) => (
        <ListRow
          key={size}
          icon={icon}
          label={size}
          sublabel={formatEuros(SERVICE_PRICES[size])}
          onPress={() => selectHome(size)}
        />
      ))}

      <Text style={styles.sectionTitle}>Cleaning Crew</Text>
      {CREW_SERVICES.map(({ service, icon }) => (
        <ListRow
          key={service}
          icon={icon}
          label={service}
          sublabel={formatEuros(SERVICE_PRICES[service])}
          onPress={() => selectCrew(service)}
        />
      ))}
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
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 14,
    marginBottom: 2,
  },
});
