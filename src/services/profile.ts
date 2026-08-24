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
  phone: string;
  address: string;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from('profiles')
    .update({
      phone: input.phone.trim() || null,
      address: input.address.trim() || null,
    })
    .eq('id', user.id);
}
