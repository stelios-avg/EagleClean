'use server';

import { revalidatePath } from 'next/cache';
import { arrivalPushCopy, completedPushCopy, normalizeArrivalTime } from '@/lib/arrival';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { BookingStatus } from '@/lib/types';

async function sendExpoPush(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>
) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      sound: 'default',
      channelId: 'default',
      title,
      body,
      data,
    }),
  });
  const json = (await response.json()) as {
    data?: { status?: string; message?: string };
  };
  if (!response.ok || json.data?.status === 'error') {
    throw new Error(json.data?.message ?? `Expo push failed (${response.status})`);
  }
}

async function pushTokenForBooking(supabase: Awaited<ReturnType<typeof createClient>>, booking: {
  push_token: string | null;
  user_id: string | null;
}) {
  if (booking.push_token) {
    return booking.push_token;
  }
  if (!booking.user_id) {
    return null;
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', booking.user_id)
    .maybeSingle();
  return profile?.push_token ?? null;
}

export async function acceptBooking(bookingId: string, arrivalTime: string) {
  await requireAdmin();
  const time = normalizeArrivalTime(arrivalTime);
  if (!time) {
    return { error: 'Διάλεξε ώρα άφιξης.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'accepted', arrival_time: time })
    .eq('id', bookingId)
    .select('id, service_date, arrival_time, push_token, user_id')
    .single();

  if (error) {
    return { error: error.message };
  }

  let notified = false;
  const token = await pushTokenForBooking(supabase, data);
  if (token && data.arrival_time) {
    const copy = arrivalPushCopy(data.service_date, data.arrival_time);
    try {
      await sendExpoPush(token, copy.title, copy.body, {
        bookingId: data.id,
        type: 'booking_accepted',
      });
      notified = true;
    } catch (e) {
      revalidatePath('/bookings');
      return { ok: true as const, notified: false, warning: (e as Error).message };
    }
  }

  revalidatePath('/bookings');
  return { ok: true as const, notified };
}

export async function completeBooking(bookingId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'completed' })
    .eq('id', bookingId)
    .eq('status', 'accepted')
    .select('id, service_date, time_slot, contact_address, push_token, user_id')
    .single();

  if (error) {
    return { error: error.message };
  }

  let notified = false;
  const token = await pushTokenForBooking(supabase, data);
  if (token) {
    const copy = completedPushCopy();
    try {
      await sendExpoPush(token, copy.title, copy.body, {
        bookingId: data.id,
        type: 'booking_completed',
        serviceDate: data.service_date,
        timeSlot: data.time_slot,
        address: data.contact_address,
      });
      notified = true;
    } catch (e) {
      revalidatePath('/bookings');
      return { ok: true as const, notified: false, warning: (e as Error).message };
    }
  }

  revalidatePath('/bookings');
  return { ok: true as const, notified };
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bookings');
  return { ok: true as const };
}

export async function deleteBooking(bookingId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bookings');
  return { ok: true as const };
}

export async function saveAdminNotes(bookingId: string, notes: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('bookings')
    .update({ admin_notes: notes.trim() || null })
    .eq('id', bookingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bookings');
  return { ok: true as const };
}
