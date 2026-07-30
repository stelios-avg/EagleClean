import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { BookingStatus } from '@/lib/types';
import { logout } from '../login/actions';
import { BookingRowActions } from './booking-row-actions';

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Εκκρεμεί',
  paid: 'Πληρωμένη',
  accepted: 'Εγκεκριμένη',
  rejected: 'Απορρίφθηκε',
  completed: 'Ολοκληρώθηκε',
  cancelled: 'Ακυρώθηκε',
};

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  paid: 'bg-blue-100 text-blue-800',
  accepted: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-zinc-100 text-zinc-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
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

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const statusFilter = params.status as BookingStatus | undefined;
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

  const filtered = all.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (!q) return true;
    return (
      b.contact_email.toLowerCase().includes(q) ||
      b.contact_phone.toLowerCase().includes(q) ||
      b.contact_address.toLowerCase().includes(q) ||
      b.option.toLowerCase().includes(q)
    );
  });

  const awaiting = (counts.paid ?? 0) + (counts.pending ?? 0);

  const filters: Array<{ key: string; label: string; href: string; count: number }> = [
    { key: 'all', label: 'Όλες', href: '/bookings', count: all.length },
    {
      key: 'paid',
      label: 'Πληρωμένες',
      href: '/bookings?status=paid',
      count: counts.paid ?? 0,
    },
    {
      key: 'accepted',
      label: 'Εγκεκριμένες',
      href: '/bookings?status=accepted',
      count: counts.accepted ?? 0,
    },
    {
      key: 'rejected',
      label: 'Απορρίψεις',
      href: '/bookings?status=rejected',
      count: counts.rejected ?? 0,
    },
  ];

  return (
    <main className="min-h-full bg-[radial-gradient(ellipse_at_top,_#e8eeff_0%,_#f4f6fb_42%,_#f4f6fb_100%)]">
      <header className="border-b border-white/10 bg-ink text-white shadow-[0_12px_40px_rgba(11,12,16,0.22)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
              <BrandLogo height={42} priority />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-blue-300">
                ADMIN PANEL
              </p>
              <h1 className="text-xl font-extrabold tracking-tight">Κρατήσεις</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 sm:block">
              {profile.email}
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink transition hover:bg-blue-50"
              >
                Αποσύνδεση
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="animate-fade-up mx-auto max-w-6xl px-6 py-7">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(16,18,24,0.05)] ring-1 ring-black/5">
            <p className="text-xs font-bold tracking-wide text-zinc-500">ΣΥΝΟΛΟ</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
              {all.length}
            </p>
          </div>
          <div className="rounded-[22px] bg-blue-600 p-5 text-white shadow-[0_12px_30px_rgba(41,70,245,0.28)]">
            <p className="text-xs font-bold tracking-wide text-white/75">ΠΡΟΣ ΕΓΚΡΙΣΗ</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">{awaiting}</p>
          </div>
          <div className="rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(16,18,24,0.05)] ring-1 ring-black/5">
            <p className="text-xs font-bold tracking-wide text-zinc-500">ΕΓΚΕΚΡΙΜΕΝΕΣ</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
              {counts.accepted ?? 0}
            </p>
          </div>
        </div>

        <form method="get" className="mb-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              ⌕
            </span>
            <input
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Αναζήτηση email, τηλέφωνο, διεύθυνση, υπηρεσία…"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
            />
          </div>
          {statusFilter ? (
            <input type="hidden" name="status" value={statusFilter} />
          ) : null}
        </form>

        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active =
              (f.key === 'all' && !statusFilter) || f.key === statusFilter;
            return (
              <Link
                key={f.key}
                href={f.href}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-[0_8px_18px_rgba(41,70,245,0.28)]'
                    : 'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <BrandLogo height={36} />
            </div>
            <p className="text-lg font-extrabold text-zinc-900">Δεν υπάρχουν κρατήσεις</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Όταν ένας πελάτης ολοκληρώσει κράτηση από το app, θα εμφανιστεί εδώ για
              αποδοχή ή απόρριψη.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_14px_40px_rgba(16,18,24,0.06)] ring-1 ring-black/5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50/90 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Πελάτης</th>
                    <th className="px-5 py-3.5 font-bold">Υπηρεσία</th>
                    <th className="px-5 py-3.5 font-bold">Ημέρα / Ώρα</th>
                    <th className="px-5 py-3.5 font-bold">Ποσό</th>
                    <th className="px-5 py-3.5 font-bold">Κατάσταση</th>
                    <th className="px-5 py-3.5 font-bold">Ενέργειες</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((b) => (
                    <tr
                      key={b.id}
                      className="align-top transition hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-zinc-900">{b.contact_email}</p>
                        <p className="mt-0.5 text-zinc-600">{b.contact_phone}</p>
                        <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-zinc-500">
                          {b.contact_address}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-zinc-900">{b.option}</p>
                        <p className="text-xs text-zinc-500">{b.category}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-zinc-900">
                          {formatDate(b.service_date)}
                        </p>
                        <p className="text-zinc-600">{b.time_slot}</p>
                      </td>
                      <td className="px-5 py-4 text-base font-extrabold text-zinc-900">
                        {euros(b.amount_cents)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[b.status]}`}
                        >
                          {STATUS_LABEL[b.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <BookingRowActions
                          bookingId={b.id}
                          status={b.status}
                          notes={b.admin_notes}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
