import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import PreloadScreen from './src/components/PreloadScreen';
import { BookingNotifications } from './src/components/BookingNotifications';
import { STRIPE_PUBLISHABLE_KEY, APPLE_MERCHANT_ID } from './src/constants/payments';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { flushPendingNavigation, navigationRef } from './src/navigation/root-navigation';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const [preloading, setPreloading] = useState(true);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'}
      merchantIdentifier={APPLE_MERCHANT_ID}
      urlScheme={
        Constants.appOwnership === 'expo'
          ? Linking.createURL('/--/')
          : Linking.createURL('')
      }
    >
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer ref={navigationRef} onReady={flushPendingNavigation}>
              <RootNavigator />
              <BookingNotifications />
            </NavigationContainer>
            {(preloading || !fontsLoaded) && (
              <PreloadScreen onDone={() => setPreloading(false)} />
            )}
            <StatusBar style={preloading ? 'dark' : 'light'} />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </StripeProvider>
  );
}
