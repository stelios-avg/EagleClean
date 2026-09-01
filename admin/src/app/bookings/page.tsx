import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { AdminHeader } from '@/components/admin-header';
import { StatusBadge } from '@/components/status-badge';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slotStartTime } from '@/lib/arrival';
import type { Booking, BookingStatus, ServiceCategory } from '@/lib/types';
import { BookingRowActions } from './booking-row-actions';
import { LiveRefresh } from './live-refresh';
import { BookingMap } from '@/components/booking-map';

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  'my-home': 'Σπίτι',
  'cleaning-crew': 'Συνεργείο',
};

function euros(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('el-GR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function timeAgo(iso: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'μόλις τώρα';
  if (minutes < 60) return `πριν ${minutes} λεπτά`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `πριν ${hours} ώρες`;
  const days = Math.floor(hours / 24);
  return `πριν ${days} ημέρες`;
}

function matchesQuery(booking: Booking, q: string) {
  return (
    (booking.contact_name ?? '').toLowerCase().includes(q) ||
    (booking.contact_email ?? '').toLowerCase().includes(q) ||
    booking.contact_phone.toLowerCase().includes(q) ||
    booking.contact_address.toLowerCase().includes(q) ||
    booking.option.toLowerCase().includes(q)
  );
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const statusParam = params.status ?? '';
  const isAwaiting = statusParam === 'awaiting';
  const statusFilter = (
    ['pending', 'paid', 'accepted', 'rejected', 'completed', 'cancelled'] as BookingStatus[]
  ).includes(statusParam as BookingStatus)
    ? (statusParam as BookingStatus)
    : undefined;
  const q = (params.q ?? '').trim().toLowerCase();

  const supabase = await createClient();
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  const all = bookings ?? [];

  const counts = all.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<BookingStatus, number>>
  );

  const awaiting = (counts.paid ?? 0) + (counts.pending ?? 0);

  const filtered = all.filter((b) => {
    if (isAwaiting && b.status !== 'paid' && b.status !== 'pending') return false;
    if (statusFilter && b.status !== statusFilter) return false;
    if (!q) return true;
    return matchesQuery(b, q);
  });

  const searchWith = (status?: string) => {
    const next = new URLSearchParams();
    if (status) next.set('status', status);
    if (params.q) next.set('q', params.q);
    const qs = next.toString();
    return qs ? `/bookings?${qs}` : '/bookings';
  };

  const filters: Array<{ key: string; label: string; href: string; count: number }> = [
    { key: 'all', label: 'Όλες', href: searchWith(), count: all.length },
    {
      key: 'awaiting',
      label: 'Προς έγκριση',
      href: searchWith('awaiting'),
      count: awaiting,
    },
    {
      key: 'accepted',
      label: 'Εγκεκριμένες',
      href: searchWith('accepted'),
      count: counts.accepted ?? 0,
    },
    {
      key: 'completed',
      label: 'Ολοκληρωμένες',
      href: searchWith('completed'),
      count: counts.completed ?? 0,
    },
    {
      key: 'rejected',
      label: 'Απορρίψεις',
      href: searchWith('rejected'),
      count: counts.rejected ?? 0,
    },
  ];

  return (
    <main className="min-h-full bg-[radial-gradient(ellipse_at_top,_#d4f4f4_0%,_#f7fcfc_42%,_#f7fcfc_100%)]">
      <AdminHeader title="Κρατήσεις" email={profile.email} extra={<LiveRefresh onDark />} />

      <div className="animate-fade-up mx-auto max-w-6xl px-6 py-7">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Link
            href={searchWith()}
            className="rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(16,22,22,0.05)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(16,22,22,0.08)]"
          >
            <p className="text-xs font-bold tracking-wide text-zinc-500">ΣΥΝΟΛΟ</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
              {all.length}
            </p>
          </Link>
          <Link
            href={searchWith('awaiting')}
            className="rounded-[22px] bg-gradient-to-br from-[#5EE0E0] to-[#1A8F8F] p-5 text-[#072424] shadow-[0_12px_30px_rgba(48,204,204,0.32)] transition hover:-translate-y-0.5 hover:brightness-105"
          >
            <p className="text-xs font-bold tracking-wide text-[#072424]/70">
              ΠΡΟΣ ΕΓΚΡΙΣΗ
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">{awaiting}</p>
          </Link>
          <Link
            href={searchWith('accepted')}
            className="rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(16,22,22,0.05)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(16,22,22,0.08)]"
          >
            <p className="text-xs font-bold tracking-wide text-zinc-500">ΕΓΚΕΚΡΙΜΕΝΕΣ</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
              {counts.accepted ?? 0}
            </p>
          </Link>
        </div>

        <form method="get" className="mb-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Αναζήτηση ονόματος, email, τηλεφώνου, διεύθυνσης…"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
            />
          </div>
          {statusParam ? <input type="hidden" name="status" value={statusParam} /> : null}
        </form>

        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active =
              (f.key === 'all' && !statusFilter && !isAwaiting) ||
              f.key === statusParam;
            return (
              <Link
                key={f.key}
                href={f.href}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition active:scale-[0.98] ${
                  active
                    ? 'bg-ink text-white shadow-[0_8px_18px_rgba(14,20,20,0.22)]'
                    : 'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-accent-soft'
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? 'bg-white/15 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {f.count}
                </span>
              </Link>
            );
          })}
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-zinc-300 bg-white/80 px-6 py-20 text-center backdrop-blur">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft">
              <BrandLogo height={36} />
            </div>
            <p className="text-lg font-extrabold text-ink">
              {all.length === 0 ? 'Δεν υπάρχουν κρατήσεις' : 'Δεν βρέθηκαν αποτελέσματα'}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              {all.length === 0
                ? 'Όταν ένας πελάτης ολοκληρώσει κράτηση από το app, θα εμφανιστεί εδώ για αποδοχή ή απόρριψη.'
                : 'Δοκίμασε άλλο φίλτρο ή καθάρισε την αναζήτηση.'}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((b) => (
              <li
                key={b.id}
                className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(16,22,22,0.05)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(16,22,22,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={b.status} />
                      {b.user_id ? null : (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-600">
                          Επισκέπτης
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-zinc-400">
                        {timeAgo(b.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-extrabold tracking-tight text-ink">
                      {b.contact_name || b.contact_email || '—'}
                    </p>
                    <div className="mt-1 flex flex-col gap-0.5 text-sm text-zinc-600">
                      <a className="w-fit hover:text-accent-dark" href={`tel:${b.contact_phone}`}>
                        {b.contact_phone}
                      </a>
                      {b.contact_email ? (
                        <a
                          className="w-fit hover:text-accent-dark"
                          href={`mailto:${b.contact_email}`}
                        >
                          {b.contact_email}
                        </a>
                      ) : null}
                      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
                        {b.contact_address}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold tracking-tight text-ink">
                    {euros(b.amount_cents)}
                  </p>
                </div>

                <div className="mt-3 max-w-md">
                  <BookingMap
                    address={b.contact_address}
                    lat={b.contact_lat}
                    lng={b.contact_lng}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-dark">
                    {b.option}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                    {CATEGORY_LABEL[b.category]}
                  </span>
                  {b.square_meters ? (
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                      {b.square_meters} m²
                    </span>
                  ) : null}
                  {b.extra_hours > 0 ? (
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                      +{b.extra_hours} ώρες
                    </span>
                  ) : null}
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                    {formatDate(b.service_date)} · {b.time_slot}
                  </span>
                  {b.arrival_time ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      Άφιξη {b.arrival_time}
                    </span>
                  ) : null}
                  {!b.push_token && (b.status === 'pending' || b.status === 'paid') ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      Χωρίς ειδοποίηση συσκευής
                    </span>
                  ) : null}
                </div>

                {(Array.isArray(b.supplies) ? b.supplies : []).length > 0 ? (
                  <div className="mt-3 rounded-2xl bg-accent-soft/60 px-3 py-2.5">
                    <p className="text-[11px] font-bold tracking-wide text-accent-dark">
                      ΥΛΙΚΑ
                    </p>
                    <ul className="mt-1 space-y-0.5 text-xs text-zinc-700">
                      {(Array.isArray(b.supplies) ? b.supplies : []).map((item) => (
                        <li key={`${item.product_id}-${item.name_el}`}>
                          {item.quantity}× {item.name_el}
                          {item.variant_label ? ` · ${item.variant_label}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-4 border-t border-zinc-100 pt-4">
                  <BookingRowActions
                    key={`${b.id}-${b.status}-${b.arrival_time ?? ''}`}
                    bookingId={b.id}
                    status={b.status}
                    notes={b.admin_notes}
                    suggestedArrival={slotStartTime(b.time_slot)}
                    arrivalTime={b.arrival_time}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
