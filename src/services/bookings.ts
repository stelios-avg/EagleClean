import { SERVICE_PRICES } from '../constants/payments';
import { supabase } from '../lib/supabase';
import type { BookingSelection, ContactDetails } from '../navigation/types';
import type { Booking, BookingStatus } from '../types/database';

export type CreateBookingInput = BookingSelection & {
  contact: ContactDetails;
  status?: BookingStatus;
  paymentIntentId?: string | null;
};

/** Persist a booking for the currently signed-in user. */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? 'Not signed in');
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      service_date: input.date,
      time_slot: input.timeSlot,
      category: input.category,
      option: input.option,
      contact_email: input.contact.email.trim(),
      contact_phone: input.contact.phone.trim(),
      contact_address: input.contact.address.trim(),
      square_meters: input.squareMeters,
      extra_hours: input.extraHours,
      amount_cents: SERVICE_PRICES[input.option],
      status: input.status ?? 'paid',
      payment_intent_id: input.paymentIntentId ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listMyBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
