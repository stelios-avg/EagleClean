import type { NavigatorScreenParams } from '@react-navigation/native';

// ---------- Domain types used by the booking flow ----------

export type ServiceCategory = 'my-home' | 'cleaning-crew';

export type HomeSize = 'Studio' | '1 Bedroom' | '2 Bedroom' | '3 Bedroom';
export type CrewService = 'Deep Cleaning' | 'Events';

export type BookingSelection = {
  /** ISO date string, e.g. "2026-08-01" */
  date: string;
  /** e.g. "09:00 - 10:00" */
  timeSlot: string;
  category: ServiceCategory;
  option: HomeSize | CrewService;
};

// ---------- Param lists (one per navigator) ----------

export type BookingStackParamList = {
  Calendar: undefined;
  TimeSlots: { date: string };
  ServiceSelection: { date: string; timeSlot: string };
  BookingSummary: BookingSelection;
  Payment: BookingSelection;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Marketplace: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  BookingFlow: NavigatorScreenParams<BookingStackParamList> | undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
};

// Makes useNavigation() fully typed everywhere without extra annotations.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
