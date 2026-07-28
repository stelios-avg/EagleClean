import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Heading, ListRow, Subtitle } from '../../components/ui';
import { SERVICE_PRICES, formatEuros } from '../../constants/payments';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, spacing } from '../../theme';
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
  const { t } = useI18n();
  const { date, timeSlot } = route.params;

  const selectHome = (option: HomeSize) =>
    navigation.navigate('BookingSummary', { date, timeSlot, category: 'my-home', option });

  const selectCrew = (option: CrewService) =>
    navigation.navigate('BookingSummary', { date, timeSlot, category: 'cleaning-crew', option });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Heading>{t('services.title')}</Heading>
      <Subtitle>{t('services.step')}</Subtitle>

      <Text style={styles.sectionTitle}>{t('services.myHome')}</Text>
      {HOME_SIZES.map(({ size, icon }) => (
        <ListRow
          key={size}
          icon={icon}
          label={t(`service.${size}`)}
          sublabel={formatEuros(SERVICE_PRICES[size])}
          onPress={() => selectHome(size)}
        />
      ))}

      <Text style={styles.sectionTitle}>{t('services.crew')}</Text>
      {CREW_SERVICES.map(({ service, icon }) => (
        <ListRow
          key={service}
          icon={icon}
          label={t(`service.${service}`)}
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
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    marginTop: 14,
    marginBottom: 2,
  },
});
