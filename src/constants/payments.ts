import { BASE_DURATION_HOURS, EXTRA_HOUR_PRICE_CENTS } from './booking';
import type { CrewService, HomeSize } from '../navigation/types';

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

/** Square meters included in the base price for every service. */
export const INCLUDED_SQM = 40;

/** €0.50 per m² above 40 m² (e.g. 60 m² → +€10.00). */
export const SQM_OVERAGE_CENTS = 50;

/** Base price = duration × €13/hour (2h → €26, 3h → €39, 4h → €52). */
export const SERVICE_PRICES: Record<HomeSize | CrewService, number> = {
  Studio: BASE_DURATION_HOURS.Studio * EXTRA_HOUR_PRICE_CENTS,
  '1 Bedroom': BASE_DURATION_HOURS['1 Bedroom'] * EXTRA_HOUR_PRICE_CENTS,
  '2 Bedroom': BASE_DURATION_HOURS['2 Bedroom'] * EXTRA_HOUR_PRICE_CENTS,
  '3 Bedroom': BASE_DURATION_HOURS['3 Bedroom'] * EXTRA_HOUR_PRICE_CENTS,
  'Deep Cleaning': BASE_DURATION_HOURS['Deep Cleaning'] * EXTRA_HOUR_PRICE_CENTS,
  Events: BASE_DURATION_HOURS.Events * EXTRA_HOUR_PRICE_CENTS,
};

export function formatEuros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** Indicative "from" price from square meters (before extra hours). */
export function indicativePriceCents(
  option: HomeSize | CrewService,
  squareMeters: number,
  _rooms?: number
): number {
  const sqm = Number.isFinite(squareMeters) && squareMeters > 0 ? squareMeters : 0;
  const extraSqm = Math.max(0, sqm - INCLUDED_SQM);
  return SERVICE_PRICES[option] + extraSqm * SQM_OVERAGE_CENTS;
}

/** Indicative price plus the per-hour charge for extra hours. */
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
