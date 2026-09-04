'use client';

import { useState, useTransition } from 'react';
import { acceptBooking, completeBooking, deleteBooking, saveAdminNotes, updateBookingStatus } from './actions';
import type { BookingStatus } from '@/lib/types';

export function BookingRowActions({
  bookingId,
  status,
  notes,
  suggestedArrival,
  arrivalTime,
}: {
  bookingId: string;
  status: BookingStatus;
  notes: string | null;
  suggestedArrival: string;
  arrivalTime: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState(notes ?? '');
  const [arrival, setArrival] = useState(arrivalTime ?? suggestedArrival);

  const complete = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeBooking(bookingId);
      if ('error' in result && result.error) {
        setError(result.error);
      } else if ('notified' in result && !result.notified) {
        setError(
          'Η κράτηση ολοκληρώθηκε. Ο πελάτης μπορεί να μην πάρει ειδοποίηση αν δεν έχει ανοιχτό το app.'
        );
      }
    });
  };

  const run = (statusNext: BookingStatus) => {
    setError(null);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, statusNext);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  const accept = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptBooking(bookingId, arrival);
      if ('error' in result && result.error) {
        setError(result.error);
      } else if ('notified' in result && !result.notified) {
        setError(
          'Η κράτηση έγινε αποδεκτή. Ο πελάτης μπορεί να μην πάρει ειδοποίηση αν δεν έχει ανοιχτό το app.'
        );
      }
    });
  };

  const saveNotes = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveAdminNotes(bookingId, noteValue);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  const remove = () => {
    if (!window.confirm('Οριστική διαγραφή της κράτησης; Δεν αναιρείται.')) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteBooking(bookingId);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  const canAccept = status === 'pending' || status === 'paid';
  const canReject = status === 'pending' || status === 'paid' || status === 'accepted';
  const canComplete = status === 'accepted';

  return (
    <div className="flex flex-col gap-2.5">
      {canAccept ? (
        <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-accent-soft/70 px-3 py-2.5">
          <label className="flex min-w-[140px] flex-1 flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide text-accent-dark">
              ΩΡΑ ΑΦΙΞΗΣ
            </span>
            <input
              type="time"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </label>
          <button
            type="button"
            disabled={pending || !arrival}
            onClick={accept}
            className="rounded-full bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97] disabled:opacity-50"
          >
            Αποδοχή & ειδοποίηση
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canComplete ? (
          <button
            type="button"
            disabled={pending}
            onClick={complete}
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.97] disabled:opacity-50"
          >
            Ολοκλήρωση & ειδοποίηση
          </button>
        ) : null}
        {canReject ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run('rejected')}
            className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.97] disabled:opacity-50"
          >
            Απόρριψη
          </button>
        ) : null}
        <button
          type="button"
          disabled={pending}
          onClick={remove}
          className="rounded-full border border-red-200 bg-white px-3.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 active:scale-[0.97] disabled:opacity-50"
        >
          Διαγραφή
        </button>
      </div>
      <div className="flex gap-2">
        <input
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          placeholder="Σημειώσεις support…"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/25"
        />
        <button
          type="button"
          disabled={pending}
          onClick={saveNotes}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-accent-soft active:scale-[0.97] disabled:opacity-50"
        >
          Αποθήκευση
        </button>
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
