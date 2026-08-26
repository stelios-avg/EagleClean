'use client';

import { useState, useTransition } from 'react';
import { deleteBooking, saveAdminNotes, updateBookingStatus } from './actions';
import type { BookingStatus } from '@/lib/types';

export function BookingRowActions({
  bookingId,
  status,
  notes,
}: {
  bookingId: string;
  status: BookingStatus;
  notes: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState(notes ?? '');

  const run = (statusNext: BookingStatus) => {
    setError(null);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, statusNext);
      if (result.error) {
        setError(result.error);
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
      <div className="flex flex-wrap gap-2">
        {canAccept ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run('accepted')}
            className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97] disabled:opacity-50"
          >
            Αποδοχή
          </button>
        ) : null}
        {canComplete ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run('completed')}
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.97] disabled:opacity-50"
          >
            Ολοκλήρωση
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
