'use client';

import { useState, useTransition } from 'react';
import { saveAdminNotes, updateBookingStatus } from './actions';
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

  return (
    <div className="flex min-w-[220px] flex-col gap-2.5">
      <div className="flex flex-wrap gap-2">
        {status !== 'accepted' && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run('accepted')}
            className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            Accept
          </button>
        )}
        {status !== 'rejected' && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run('rejected')}
            className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        )}
        {status === 'accepted' && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run('completed')}
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
          >
            Completed
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          placeholder="Σημειώσεις support…"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
        />
        <button
          type="button"
          disabled={pending}
          onClick={saveNotes}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          Save
        </button>
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
