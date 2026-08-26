'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Auto-refreshes the bookings list without a manual reload:
 * - Supabase Realtime pushes INSERT/UPDATE events for the bookings table
 * - a 60s polling interval and a refresh-on-focus act as a safety net
 */
export function LiveRefresh({ onDark = false }: { onDark?: boolean }) {
  const router = useRouter();
  const [live, setLive] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const refresh = () => {
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
      debounce.current = setTimeout(() => router.refresh(), 400);
    };

    const channel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        refresh
      )
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED');
      });

    const interval = setInterval(() => router.refresh(), 60_000);
    const onFocus = () => router.refresh();
    window.addEventListener('focus', onFocus);

    return () => {
      void supabase.removeChannel(channel);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
    };
  }, [router]);

  const idle = onDark
    ? 'bg-white/10 text-white/55'
    : 'bg-zinc-100 text-zinc-500';
  const active = onDark
    ? 'bg-accent/20 text-accent'
    : 'bg-accent-soft text-accent-dark';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        live ? active : idle
      }`}
      title={live ? 'Ζωντανή ενημέρωση ενεργή' : 'Ανανέωση κάθε 60"'}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          live ? 'animate-live-dot bg-accent' : 'bg-current opacity-50'
        }`}
      />
      LIVE
    </span>
  );
}
