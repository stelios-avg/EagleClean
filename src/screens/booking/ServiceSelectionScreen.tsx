import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Heading, ListRow, Subtitle } from '../../components/ui';
import { BASE_DURATION_HOURS, slotLabel } from '../../constants/booking';
import { SERVICE_PRICES, formatEuros } from '../../constants/payments';
import { useI18n } from '../../i18n/LanguageContext';
import { colors, fonts, spacing } from '../../theme';
import type {
  BookingStackParamList,
  CrewService,
  HomeSize,
  ServiceCategory,
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
  const { date, startHour, extraHours, squareMeters } = route.params;

  // The visit length depends on the service, so the final time range is
  // computed here, once the option is known.
  const select = (category: ServiceCategory, option: HomeSize | CrewService) =>
    navigation.navigate('BookingSummary', {
      date,
      timeSlot: slotLabel(startHour, BASE_DURATION_HOURS[option] + extraHours),
      category,
      option,
      squareMeters,
      extraHours,
    });

  const sublabelFor = (option: HomeSize | CrewService) =>
    `${formatEuros(SERVICE_PRICES[option])} · ${BASE_DURATION_HOURS[option]} ${t('unit.hours')}`;

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
          sublabel={sublabelFor(size)}
          onPress={() => select('my-home', size)}
        />
      ))}

      <Text style={styles.sectionTitle}>{t('services.crew')}</Text>
      {CREW_SERVICES.map(({ service, icon }) => (
        <ListRow
          key={service}
          icon={icon}
          label={t(`service.${service}`)}
          sublabel={sublabelFor(service)}
          onPress={() => select('cleaning-crew', service)}
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
