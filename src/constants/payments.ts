import type { CrewService, HomeSize } from '../navigation/types';

/**
 * Stripe publishable key (test mode). Safe to ship in the client.
 * Replace with your real pk_test_... / pk_live_... key.
 * The secret key NEVER goes in the app — it lives in the Supabase Edge
 * Function that creates PaymentIntents (Phase 2).
 */
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_REPLACE_ME';

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
