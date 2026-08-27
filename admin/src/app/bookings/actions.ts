'use server';

import { revalidatePath } from 'next/cache';
import { arrivalPushCopy, normalizeArrivalTime } from '@/lib/arrival';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { BookingStatus } from '@/lib/types';

async function sendExpoPush(token: string, title: string, body: string, bookingId: string) {
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
      data: { bookingId, type: 'booking_accepted' },
    }),
  });
  const json = (await response.json()) as {
    data?: { status?: string; message?: string };
  };
  if (!response.ok || json.data?.status === 'error') {
    throw new Error(json.data?.message ?? `Expo push failed (${response.status})`);
  }
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

  let token = data.push_token;
  if (!token && data.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', data.user_id)
      .maybeSingle();
    token = profile?.push_token ?? null;
  }

  let notified = false;
  if (token && data.arrival_time) {
    const copy = arrivalPushCopy(data.service_date, data.arrival_time);
    try {
      await sendExpoPush(token, copy.title, copy.body, data.id);
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
