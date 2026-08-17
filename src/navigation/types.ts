import type { NavigatorScreenParams } from '@react-navigation/native';

// ---------- Domain types used by the booking flow ----------

export type ServiceCategory = 'my-home' | 'cleaning-crew';

export type HomeSize = 'Studio' | '1 Bedroom' | '2 Bedroom' | '3 Bedroom';
export type CrewService = 'Deep Cleaning' | 'Events';

export type BookingSelection = {
  /** ISO date string, e.g. "2026-08-01" */
  date: string;
  /** Final visit range including extra hours, e.g. "08:00 - 12:00" */
  timeSlot: string;
  category: ServiceCategory;
  option: HomeSize | CrewService;
  /** Size of the home/venue in m² — mandatory before continuing. */
  squareMeters: number;
  /** Hours added on top of the base slot via the + stepper. */
  extraHours: number;
};

/** Mandatory customer details collected before payment. */
export type ContactDetails = {
  email: string;
  phone: string;
  address: string;
};

// ---------- Param lists (one per navigator) ----------

export type BookingStackParamList = {
  /** `preselected` skips the ServiceSelection step (set when a category is tapped on Home). */
  Calendar: { preselected?: HomeSize | CrewService } | undefined;
  /**
   * The final time range depends on the service duration, so before a
   * service is chosen we carry the raw start hour + extras instead of a slot.
   */
  ServiceSelection: {
    date: string;
    startHour: number;
    extraHours: number;
    squareMeters: number;
  };
  BookingSummary: BookingSelection;
  ContactDetails: BookingSelection;
  Payment: BookingSelection & { contact: ContactDetails };
  Confirmation: BookingSelection & { contact: ContactDetails };
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
