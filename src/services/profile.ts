import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

export async function getMyProfile(): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? 'Not signed in');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateMyProfile(input: {
  fullName: string;
  phone: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? 'Not signed in');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName.trim() || null,
      phone: input.phone.trim() || null,
      address: input.address.trim() || null,
      address_lat: input.latitude ?? null,
      address_lng: input.longitude ?? null,
    })
    .eq('id', user.id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Persists the contact details entered during a booking so the next
 * booking can skip the contact step entirely.
 */
export async function saveContactInfo(input: {
  fullName?: string;
  phone: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...(input.fullName != null ? { full_name: input.fullName.trim() || null } : {}),
      phone: input.phone.trim() || null,
      address: input.address.trim() || null,
      ...(input.latitude !== undefined ? { address_lat: input.latitude } : {}),
      ...(input.longitude !== undefined ? { address_lng: input.longitude } : {}),
    })
    .eq('id', user.id);

  if (error) {
    throw new Error(error.message);
  }
}
