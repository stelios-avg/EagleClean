import type { BookingStatus } from '@/lib/types';

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
  paid: 'bg-accent-soft text-accent-dark',
  accepted: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-zinc-100 text-zinc-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
};

export function statusLabel(status: BookingStatus) {
  return STATUS_LABEL[status];
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
