import type { BookedRange } from '../constants/booking';
import { bookingGrandTotalCents } from '../constants/payments';
import { supabase } from '../lib/supabase';
import type { BookingSelection, ContactDetails } from '../navigation/types';
import type { Booking, BookingStatus } from '../types/database';
import { getCachedPushToken, registerPushNotifications } from './notifications';

export type CreateBookingInput = BookingSelection & {
  contact: ContactDetails;
  status?: BookingStatus;
  paymentIntentId?: string | null;
};

/** Persist a booking. Signed-in customers are linked; guests stay anonymous. */
export async function createBooking(input: CreateBookingInput): Promise<Booking | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  const supplies = input.supplies ?? [];
  const pushToken = getCachedPushToken() ?? (await registerPushNotifications());

  const row = {
    user_id: user?.id ?? null,
    service_date: input.date,
    time_slot: input.timeSlot,
    category: input.category,
    option: input.option,
    contact_name: input.contact.name.trim(),
    contact_email: input.contact.email.trim() || null,
    contact_phone: input.contact.phone.trim(),
    contact_address: input.contact.address.trim(),
    contact_lat: input.contact.latitude ?? null,
    contact_lng: input.contact.longitude ?? null,
    square_meters: input.squareMeters,
    extra_hours: input.extraHours,
    amount_cents: bookingGrandTotalCents(
      input.option,
      input.extraHours,
      input.squareMeters,
      input.rooms,
      supplies
    ),
    supplies: supplies.map((item) => ({
      product_id: item.productId,
      name_el: item.nameEl,
      name_en: item.nameEn,
      variant_label: item.variantLabel,
      unit_price_cents: item.unitPriceCents,
      quantity: item.quantity,
    })),
    status: input.status ?? 'paid',
    payment_intent_id: input.paymentIntentId ?? null,
    push_token: pushToken,
  };

  if (user) {
    const { data, error } = await supabase.from('bookings').insert(row).select().single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // Guest inserts cannot RETURNING under RLS (no SELECT policy for anon).
  const { error } = await supabase.from('bookings').insert(row);
  if (error) {
    throw new Error(error.message);
  }
  return null;
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
