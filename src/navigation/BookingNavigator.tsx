import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '../screens/booking/CalendarScreen';
import TimeSlotsScreen from '../screens/booking/TimeSlotsScreen';
import ServiceSelectionScreen from '../screens/booking/ServiceSelectionScreen';
import BookingSummaryScreen from '../screens/booking/BookingSummaryScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';
import { colors } from '../theme';
import type { BookingStackParamList } from './types';

const Stack = createNativeStackNavigator<BookingStackParamList>();

/**
 * Sequential booking flow: Calendar -> Time Slots -> Service Selection
 * -> Summary -> Payment. Selections accumulate in route params; the back
 * button naturally un-does one step at a time. Auth-agnostic until the
 * final confirm step.
 */
export default function BookingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.textOnDark,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Select a Day' }}
      />
      <Stack.Screen
        name="TimeSlots"
        component={TimeSlotsScreen}
        options={{ title: 'Select a Time' }}
      />
      <Stack.Screen
        name="ServiceSelection"
        component={ServiceSelectionScreen}
        options={{ title: 'Select a Service' }}
      />
      <Stack.Screen
        name="BookingSummary"
        component={BookingSummaryScreen}
        options={{ title: 'Summary' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
    </Stack.Navigator>
  );
}
