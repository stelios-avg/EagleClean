import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ShopCategorySlug } from '../constants/shop';

// ---------- Domain types used by the booking flow ----------

export type ServiceCategory = 'my-home' | 'cleaning-crew' | 'ironing';

export type HomeSize = 'Studio' | '1 Bedroom' | '2 Bedroom' | '3 Bedroom';
export type CrewService = 'Deep Cleaning' | 'Events';
export type IroningService = 'Ironing';
export type BookingOption = HomeSize | CrewService | IroningService;

export const HOME_SIZES: HomeSize[] = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom'];
export const CREW_SERVICES: CrewService[] = ['Deep Cleaning', 'Events'];

export function isHomeSize(option: BookingOption): option is HomeSize {
  return (HOME_SIZES as string[]).includes(option);
}

export function isIroning(option: BookingOption): option is IroningService {
  return option === 'Ironing';
}

export function categoryFor(option: BookingOption): ServiceCategory {
  if (isIroning(option)) {
    return 'ironing';
  }
  return isHomeSize(option) ? 'my-home' : 'cleaning-crew';
}

/** Studio is 0 bedrooms; 3+ bedrooms use the 3 Bedroom rate. */
export function homeSizeFromRooms(rooms: number): HomeSize {
  if (rooms <= 0) {
    return 'Studio';
  }
  if (rooms === 1) {
    return '1 Bedroom';
  }
  if (rooms === 2) {
    return '2 Bedroom';
  }
  return '3 Bedroom';
}

export function roomsFromOption(option: BookingOption): number {
  switch (option) {
    case 'Studio':
      return 0;
    case '1 Bedroom':
      return 1;
    case '2 Bedroom':
      return 2;
    case '3 Bedroom':
      return 3;
    default:
      return 2;
  }
}

/** Marketplace line items attached to a cleaning booking. */
export type BookingSupply = {
  productId: string;
  nameEl: string;
  nameEn: string;
  variantLabel: string | null;
  unitPriceCents: number;
  quantity: number;
};

export type BookingExtraId = 'ironing' | 'hoover' | 'oven' | 'fireplace';

export type BookingSelection = {
  /** ISO date string, e.g. "2026-08-01" */
  date: string;
  /** Final visit range including extra hours, e.g. "08:00 - 12:00" */
  timeSlot: string;
  category: ServiceCategory;
  option: BookingOption;
  /** Bedroom count used for the quote (Studio = 0). */
  rooms: number;
  /** Size of the home/venue in m² — mandatory before continuing. Unused for ironing. */
  squareMeters: number;
  /** Piece count for ironing. */
  pieces?: number;
  /** Hours added on top of the base slot via the + stepper. */
  extraHours: number;
  /** Add-on services chosen on the summary (ironing, hoover, oven, fireplace). */
  extras?: BookingExtraId[];
  /** Set on the summary step: `[]` means continue without supplies. */
  supplies?: BookingSupply[];
};

/** Mandatory customer details collected before payment. */
export type ContactDetails = {
  name: string;
  /** Optional for guest checkout. */
  email: string;
  phone: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
};

// ---------- Param lists (one per navigator) ----------

export type BookingStackParamList = {
  /** First step: rooms + sqm → indicative "from" price, then calendar. */
  Quote: { option?: BookingOption } | undefined;
  Calendar: {
    option: BookingOption;
    rooms: number;
    squareMeters: number;
    pieces?: number;
  };
  BookingSummary: BookingSelection;
  BookingSupplies: BookingSelection;
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
  MyBookings: undefined;
  Profile: undefined;
  ShopCategory: { category: ShopCategorySlug };
  ShopCart: undefined;
  ShopCheckout: undefined;
};

// Makes useNavigation() fully typed everywhere without extra annotations.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
