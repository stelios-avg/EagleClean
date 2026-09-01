import Link from 'next/link';
import { AdminHeader } from '@/components/admin-header';
import { requireAdmin } from '@/lib/auth';
import { shiftIsoDate, todayInCyprus, type ClosedRange } from '@/lib/slots';
import { createClient } from '@/lib/supabase/server';
import { DateJump } from './date-jump';
import { SlotBoard } from './slot-board';

function prettyDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('el-GR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function SlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const today = todayInCyprus();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? '') ? params.date! : today;

  const supabase = await createClient();
  const [{ data: closedRows }, { data: dayBookings }] = await Promise.all([
    supabase
      .from('closed_slots')
      .select('start_hour, end_hour')
      .eq('service_date', date),
    supabase
      .from('bookings')
      .select('id, time_slot, status, contact_name, option')
      .eq('service_date', date)
      .in('status', ['pending', 'paid', 'accepted'])
      .order('time_slot'),
  ]);

  const closed = (closedRows ?? []) as ClosedRange[];
  const bookings = dayBookings ?? [];

  return (
    <main className="min-h-full bg-[radial-gradient(ellipse_at_top,_#d4f4f4_0%,_#f7fcfc_42%,_#f7fcfc_100%)]">
      <AdminHeader title="Ώρες" email={profile.email} />
      <div className="mx-auto max-w-6xl px-6 py-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-wide text-zinc-500">ΗΜΕΡΑ</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink capitalize">
              {prettyDate(date)}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/slots?date=${shiftIsoDate(date, -1)}`}
              className="rounded-full bg-white px-3 py-2 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200 hover:bg-accent-soft"
            >
              Προηγούμενη
            </Link>
            <DateJump date={date} />
            <Link
              href={`/slots?date=${shiftIsoDate(date, 1)}`}
              className="rounded-full bg-white px-3 py-2 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200 hover:bg-accent-soft"
            >
              Επόμενη
            </Link>
            {date !== today ? (
              <Link
                href="/slots"
                className="rounded-full bg-ink px-3 py-2 text-xs font-bold text-white"
              >
                Σήμερα
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(16,22,22,0.05)] ring-1 ring-black/5">
          <p className="mb-4 text-[11px] font-bold tracking-wide text-accent-dark">
            ΚΛΕΙΣΕ / ΑΝΟΙΞΕ SLOTS
          </p>
          <SlotBoard date={date} closed={closed} />
        </div>

        <div className="mt-5 rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(16,22,22,0.05)] ring-1 ring-black/5">
          <p className="text-[11px] font-bold tracking-wide text-zinc-500">
            ΚΡΑΤΗΣΕΙΣ ΑΥΤΗΣ ΤΗΣ ΗΜΕΡΑΣ
          </p>
          {bookings.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Καμία ενεργή κράτηση.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {bookings.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-2 text-sm text-zinc-700">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold">
                    {b.time_slot}
                  </span>
                  <span className="font-bold text-ink">{b.contact_name || '—'}</span>
                  <span className="text-zinc-500">{b.option}</span>
                  <span className="text-xs font-semibold uppercase text-zinc-400">{b.status}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-zinc-500">
            Η κράτηση δεν κλείνει αυτόματα το slot. Αφού την αποδεχτείς, κλείσε την ώρα από πάνω αν
            δεν θέλεις άλλη κράτηση.
          </p>
        </div>
      </div>
    </main>
  );
}
