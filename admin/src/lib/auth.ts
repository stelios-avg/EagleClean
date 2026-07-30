import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { Profile } from './types';

export async function getAdminProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  return profile;
}

/** Redirects to /login if the visitor is not an admin. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getAdminProfile();
  if (!profile) {
    redirect('/login');
  }
  return profile;
}
