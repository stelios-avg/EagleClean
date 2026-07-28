import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '../screens/booking/CalendarScreen';
import ServiceSelectionScreen from '../screens/booking/ServiceSelectionScreen';
import BookingSummaryScreen from '../screens/booking/BookingSummaryScreen';
import ContactDetailsScreen from '../screens/booking/ContactDetailsScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';
import { useI18n } from '../i18n/LanguageContext';
import { colors, fonts } from '../theme';
import type { BookingStackParamList } from './types';

const Stack = createNativeStackNavigator<BookingStackParamList>();

/**
 * Sequential booking flow: Calendar -> Time Slots -> Service Selection
 * -> Summary -> Contact Details (mandatory) -> Payment. Selections
 * accumulate in route params. Auth is enforced at the Summary step.
 */
export default function BookingNavigator() {
  const { t } = useI18n();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.textOnDark,
        headerTitleStyle: { fontFamily: fonts.bold },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: t('nav.selectDay') }}
      />
      <Stack.Screen
        name="ServiceSelection"
        component={ServiceSelectionScreen}
        options={{ title: t('nav.selectService') }}
      />
      <Stack.Screen
        name="BookingSummary"
        component={BookingSummaryScreen}
        options={{ title: t('nav.summary') }}
      />
      <Stack.Screen
        name="ContactDetails"
        component={ContactDetailsScreen}
        options={{ title: t('nav.contact') }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: t('nav.payment') }}
      />
    </Stack.Navigator>
  );
}
