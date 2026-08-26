import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuoteScreen from '../screens/booking/QuoteScreen';
import CalendarScreen from '../screens/booking/CalendarScreen';
import BookingSummaryScreen from '../screens/booking/BookingSummaryScreen';
import ContactDetailsScreen from '../screens/booking/ContactDetailsScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';
import ConfirmationScreen from '../screens/booking/ConfirmationScreen';
import { useI18n } from '../i18n/LanguageContext';
import { colors, fonts } from '../theme';
import type { BookingStackParamList } from './types';

const Stack = createNativeStackNavigator<BookingStackParamList>();

/**
 * Sequential booking flow: Quote (rooms + sqm) -> Calendar -> Summary
 * -> Contact Details (mandatory) -> Payment. Selections accumulate in
 * route params. Auth is enforced at the Summary step.
 */
export default function BookingNavigator() {
  const { t } = useI18n();
  return (
    <Stack.Navigator
      initialRouteName="Quote"
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.textOnDark,
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17 },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Quote"
        component={QuoteScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ headerShown: false }}
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
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
