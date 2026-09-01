export type ClosedRange = { start_hour: number; end_hour: number };

export const TWO_HOUR_SLOTS: ClosedRange[] = [
  { start_hour: 8, end_hour: 10 },
  { start_hour: 10, end_hour: 12 },
  { start_hour: 12, end_hour: 14 },
  { start_hour: 14, end_hour: 16 },
  { start_hour: 16, end_hour: 18 },
];

export const ALL_DAY_RANGE: ClosedRange = { start_hour: 8, end_hour: 20 };

export function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function rangeLabel(range: ClosedRange) {
  return `${formatHour(range.start_hour)} – ${formatHour(range.end_hour)}`;
}

export function rangesOverlap(a: ClosedRange, b: ClosedRange) {
  return a.start_hour < b.end_hour && a.end_hour > b.start_hour;
}

export function isRangeClosed(range: ClosedRange, closed: ClosedRange[]) {
  return closed.some((c) => rangesOverlap(range, c));
}

/** Subtract openRange from closed, returning leftover closed fragments. */
export function subtractRange(closed: ClosedRange[], openRange: ClosedRange): ClosedRange[] {
  const next: ClosedRange[] = [];
  for (const c of closed) {
    if (!rangesOverlap(c, openRange)) {
      next.push(c);
      continue;
    }
    if (c.start_hour < openRange.start_hour) {
      next.push({ start_hour: c.start_hour, end_hour: openRange.start_hour });
    }
    if (c.end_hour > openRange.end_hour) {
      next.push({ start_hour: openRange.end_hour, end_hour: c.end_hour });
    }
  }
  return next;
}

export function todayInCyprus() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Nicosia' });
}

export function shiftIsoDate(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}
