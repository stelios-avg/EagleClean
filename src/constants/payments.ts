import { isHomeSize, type CrewService, type HomeSize } from '../navigation/types';
import { EXTRA_HOUR_PRICE_CENTS } from './booking';

/**
 * Stripe publishable key (test or live). Safe to ship in the client.
 * The secret key NEVER goes in the app — it lives in the Supabase Edge
 * Function `create-payment-intent`.
 */
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

/** Must match the merchantIdentifier in app.json and your Apple Developer account. */
export const APPLE_MERCHANT_ID = 'merchant.com.eagleclean.app';

export const MERCHANT_NAME = 'EagleClean';
export const MERCHANT_COUNTRY_CODE = 'CY'; // ISO country of the business
export const CURRENCY_CODE = 'EUR';

/** Mock price list in cents. Phase 2 moves this into the Supabase `services` table. */
export const SERVICE_PRICES: Record<HomeSize | CrewService, number> = {
  Studio: 3900,
  '1 Bedroom': 4900,
  '2 Bedroom': 5900,
  '3 Bedroom': 6900,
  'Deep Cleaning': 8900,
  Events: 12900,
};

export function formatEuros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** Square meters included in the base service price before overage. */
export const INCLUDED_SQM: Record<HomeSize | CrewService, number> = {
  Studio: 40,
  '1 Bedroom': 70,
  '2 Bedroom': 100,
  '3 Bedroom': 140,
  'Deep Cleaning': 100,
  Events: 200,
};

/** €0.50 per m² above the included allowance. */
export const SQM_OVERAGE_CENTS = 50;

/** Deep / Events: €10 per bedroom above 2. */
export const EXTRA_ROOM_CENTS = 1000;

/** Indicative "from" price from rooms + square meters (before extra hours). */
export function indicativePriceCents(
  option: HomeSize | CrewService,
  squareMeters: number,
  rooms?: number
): number {
  const sqm = Number.isFinite(squareMeters) && squareMeters > 0 ? squareMeters : 0;
  const extraSqm = Math.max(0, sqm - INCLUDED_SQM[option]);
  const extraRooms =
    !isHomeSize(option) && rooms != null ? Math.max(0, rooms - 2) * EXTRA_ROOM_CENTS : 0;
  return SERVICE_PRICES[option] + extraSqm * SQM_OVERAGE_CENTS + extraRooms;
}

/** Indicative price plus the flat per-hour charge for extra hours. */
export function bookingTotalCents(
  option: HomeSize | CrewService,
  extraHours: number,
  squareMeters: number,
  rooms?: number
): number {
  return indicativePriceCents(option, squareMeters, rooms) + extraHours * EXTRA_HOUR_PRICE_CENTS;
}

export function suppliesTotalCents(
  supplies: { unitPriceCents: number; quantity: number }[]
): number {
  return supplies.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
}

export function bookingGrandTotalCents(
  option: HomeSize | CrewService,
  extraHours: number,
  squareMeters: number,
  rooms?: number,
  supplies: { unitPriceCents: number; quantity: number }[] = []
): number {
  return bookingTotalCents(option, extraHours, squareMeters, rooms) + suppliesTotalCents(supplies);
}
