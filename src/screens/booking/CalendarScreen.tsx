import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Heading, ListRow, Subtitle } from '../../components/ui';
import { colors, spacing } from '../../theme';
import type { BookingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<BookingStackParamList, 'Calendar'>;

/** Mock: next 14 days. Phase 2 replaces this with a real calendar component. */
function getUpcomingDates(count = 14): { iso: string; weekday: string; date: string }[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString(undefined, { weekday: 'long' }),
      date: d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' }),
    };
  });
}

export default function CalendarScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <FlatList
        data={getUpcomingDates()}
        keyExtractor={(item) => item.iso}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Heading>Pick a day</Heading>
            <Subtitle>Step 1 of 3 — when should we come?</Subtitle>
          </View>
        }
        renderItem={({ item }) => (
          <ListRow
            icon="calendar-outline"
            label={item.weekday}
            sublabel={item.date}
            onPress={() => navigation.navigate('TimeSlots', { date: item.iso })}
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
