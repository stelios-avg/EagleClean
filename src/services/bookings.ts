import type { BookedRange } from '../constants/booking';
import { bookingTotalCents } from '../constants/payments';
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
      amount_cents: bookingTotalCents(input.option, input.extraHours),
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

/** Customer-side cancellation; RLS only allows it while pending/paid. */
export async function cancelBooking(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Occupied time ranges for a day, via a SECURITY DEFINER function so
 * guests can see availability without seeing anyone's booking details.
 */
export async function getBookedSlots(date: string): Promise<BookedRange[]> {
  const { data, error } = await supabase.rpc('get_booked_slots', { day: date });

  if (error) {
    throw new Error(error.message);
  }

  return (data as BookedRange[] | null) ?? [];
}
