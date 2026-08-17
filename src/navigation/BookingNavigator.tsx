import React from 'react';
import { Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CalendarScreen from '../screens/booking/CalendarScreen';
import ServiceSelectionScreen from '../screens/booking/ServiceSelectionScreen';
import BookingSummaryScreen from '../screens/booking/BookingSummaryScreen';
import ContactDetailsScreen from '../screens/booking/ContactDetailsScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';
import ConfirmationScreen from '../screens/booking/ConfirmationScreen';
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
        headerStyle: { backgroundColor: colors.accent },
        headerTintColor: colors.textOnDark,
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17 },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={({ navigation }) => ({
          title: t('nav.selectDay'),
          // Calendar is the first screen of this stack, so the native back
          // arrow never shows — add one that dismisses the whole flow.
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.getParent()?.goBack()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="chevron-back" size={24} color={colors.textOnDark} />
            </Pressable>
          ),
        })}
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
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
