import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingCompleted: RootStackParamList['BookingCompleted'] | null = null;

export function navigateToBookingCompleted(
  params: RootStackParamList['BookingCompleted']
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('BookingCompleted', params);
    return;
  }
  pendingCompleted = params;
}

export function flushPendingNavigation() {
  if (!pendingCompleted || !navigationRef.isReady()) {
    return;
  }
  navigationRef.navigate('BookingCompleted', pendingCompleted);
  pendingCompleted = null;
}
