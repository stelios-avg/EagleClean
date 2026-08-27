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
      rooms: booking.rooms,
      supplies: booking.supplies ?? [],
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
