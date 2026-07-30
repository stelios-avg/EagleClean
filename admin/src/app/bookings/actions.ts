'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { BookingStatus } from '@/lib/types';

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
