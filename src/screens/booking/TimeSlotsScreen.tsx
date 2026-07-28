import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip, Heading, Subtitle } from '../../components/ui';
import { colors, spacing } from '../../theme';
import type { BookingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'TimeSlots'>;

/** Mock: 1-hour intervals, 08:00-18:00. Phase 2 fetches real availability from Supabase. */
const SLOTS = Array.from({ length: 10 }, (_, i) => {
  const start = String(8 + i).padStart(2, '0');
  const end = String(9 + i).padStart(2, '0');
  return `${start}:00 - ${end}:00`;
});

export default function TimeSlotsScreen({ navigation, route }: Props) {
  const { date } = route.params;
  const prettyDate = new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.root}>
      <FlatList
        data={SLOTS}
        keyExtractor={(slot) => slot}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Heading>Pick a time</Heading>
            <Subtitle>Step 2 of 3 — available slots on {prettyDate}</Subtitle>
          </View>
        }
        renderItem={({ item }) => (
          <Chip
            label={item}
            onPress={() => navigation.navigate('ServiceSelection', { date, timeSlot: item })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
  },
  header: {
    gap: 6,
    marginBottom: 16,
  },
});
