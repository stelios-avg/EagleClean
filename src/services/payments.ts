import { supabase } from '../lib/supabase';
import type { BookingSelection, ContactDetails } from '../navigation/types';

export type PaymentIntentResult = {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
};

/** Asks the Edge Function to create a Stripe PaymentIntent (secret key stays on the server). */
export async function createPaymentIntent(
  booking: BookingSelection & { contact: ContactDetails }
): Promise<PaymentIntentResult> {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: {
      option: booking.option,
      extraHours: booking.extraHours,
      squareMeters: booking.squareMeters,
      pieces: booking.pieces,
      rooms: booking.rooms,
      supplies: booking.supplies ?? [],
      extras: booking.extras ?? [],
      date: booking.date,
      timeSlot: booking.timeSlot,
      contactName: booking.contact.name,
      contactEmail: booking.contact.email,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data as PaymentIntentResult & { error?: string };
  if (!result?.clientSecret) {
    throw new Error(result?.error ?? 'Could not start Stripe payment.');
  }

  return result;
}

export type MembershipCheckoutResult = {
  clientSecret?: string;
  subscriptionId?: string;
  paymentIntentId?: string | null;
  amount?: number;
  alreadyActive?: boolean;
  status?: string;
  renewsAt?: string | null;
};

/** Starts or confirms the €14.99/month Stripe subscription. */
export async function startMembership(): Promise<MembershipCheckoutResult> {
  const { data, error } = await supabase.functions.invoke('create-membership', {
    body: {},
  });
  if (error) {
    throw new Error(error.message);
  }
  const result = data as MembershipCheckoutResult & { error?: string };
  if (result?.error) {
    throw new Error(result.error);
  }
  if (result?.alreadyActive) {
    return result;
  }
  if (!result?.clientSecret) {
    throw new Error('Could not start membership payment.');
  }
  return result;
}

export async function confirmMembership(subscriptionId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('create-membership', {
    body: { confirm: true, subscriptionId },
  });
  if (error) {
    throw new Error(error.message);
  }
  const result = data as { error?: string; status?: string };
  if (result?.error) {
    throw new Error(result.error);
  }
}
