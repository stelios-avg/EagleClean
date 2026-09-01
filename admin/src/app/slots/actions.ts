'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import {
  ALL_DAY_RANGE,
  subtractRange,
  type ClosedRange,
} from '@/lib/slots';
import { createClient } from '@/lib/supabase/server';

function isValidRange(start: number, end: number) {
  return Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end > start && end <= 24;
}

async function loadClosed(date: string): Promise<(ClosedRange & { id: string })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('closed_slots')
    .select('id, start_hour, end_hour')
    .eq('service_date', date);
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function closeSlot(date: string, startHour: number, endHour: number) {
  await requireAdmin();
  if (!isValidRange(startHour, endHour)) {
    return { error: 'Μη έγκυρο slot.' };
  }
  const supabase = await createClient();
  const { error } = await supabase.from('closed_slots').insert({
    service_date: date,
    start_hour: startHour,
    end_hour: endHour,
  });
  if (error && error.code !== '23505') {
    return { error: error.message };
  }
  revalidatePath('/slots');
  return { ok: true as const };
}

export async function openSlot(date: string, startHour: number, endHour: number) {
  await requireAdmin();
  if (!isValidRange(startHour, endHour)) {
    return { error: 'Μη έγκυρο slot.' };
  }
  const supabase = await createClient();
  const existing = await loadClosed(date);
  const openRange = { start_hour: startHour, end_hour: endHour };
  const leftovers = subtractRange(existing, openRange);

  const { error: delError } = await supabase.from('closed_slots').delete().eq('service_date', date);
  if (delError) {
    return { error: delError.message };
  }
  if (leftovers.length > 0) {
    const { error: insError } = await supabase.from('closed_slots').insert(
      leftovers.map((r) => ({
        service_date: date,
        start_hour: r.start_hour,
        end_hour: r.end_hour,
      }))
    );
    if (insError) {
      return { error: insError.message };
    }
  }
  revalidatePath('/slots');
  return { ok: true as const };
}

export async function closeWholeDay(date: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from('closed_slots').delete().eq('service_date', date);
  const { error } = await supabase.from('closed_slots').insert({
    service_date: date,
    start_hour: ALL_DAY_RANGE.start_hour,
    end_hour: ALL_DAY_RANGE.end_hour,
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/slots');
  return { ok: true as const };
}

export async function openWholeDay(date: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('closed_slots').delete().eq('service_date', date);
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/slots');
  return { ok: true as const };
}
