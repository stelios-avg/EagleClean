'use client';

import { useState, useTransition } from 'react';
import {
  ALL_DAY_RANGE,
  isRangeClosed,
  rangeLabel,
  TWO_HOUR_SLOTS,
  type ClosedRange,
} from '@/lib/slots';
import { closeSlot, closeWholeDay, openSlot, openWholeDay } from './actions';

function cyprusNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Nicosia',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    hour: Number(map.hour),
  };
}

function hasPassed(date: string, startHour: number) {
  const now = cyprusNow();
  if (date < now.date) {
    return true;
  }
  if (date > now.date) {
    return false;
  }
  return now.hour >= startHour;
}

export function SlotBoard({
  date,
  closed,
}: {
  date: string;
  closed: ClosedRange[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dayClosed = isRangeClosed(ALL_DAY_RANGE, closed);
  const dayPassed = hasPassed(date, ALL_DAY_RANGE.start_hour);

  const toggle = (range: ClosedRange) => {
    const shut = isRangeClosed(range, closed);
    setError(null);
    startTransition(async () => {
      const result = shut
        ? await openSlot(date, range.start_hour, range.end_hour)
        : await closeSlot(date, range.start_hour, range.end_hour);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  const toggleDay = () => {
    setError(null);
    startTransition(async () => {
      const result = dayClosed ? await openWholeDay(date) : await closeWholeDay(date);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {TWO_HOUR_SLOTS.map((range) => {
          const shut = isRangeClosed(range, closed);
          const passed = hasPassed(date, range.start_hour);
          return (
            <button
              key={`${range.start_hour}-${range.end_hour}`}
              type="button"
              disabled={pending || passed}
              onClick={() => toggle(range)}
              className={`rounded-2xl px-4 py-3 text-sm font-bold shadow-sm transition active:scale-[0.97] disabled:opacity-45 ${
                shut
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white text-ink ring-1 ring-zinc-200 hover:bg-accent-soft'
              }`}
            >
              {rangeLabel(range)}
              <span className="mt-0.5 block text-[11px] font-semibold opacity-80">
                {passed ? 'Πέρασε' : shut ? 'Κλειστό' : 'Ανοιχτό'}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={pending || dayPassed}
        onClick={toggleDay}
        className={`w-fit rounded-2xl px-4 py-3 text-sm font-bold shadow-sm transition active:scale-[0.97] disabled:opacity-45 ${
          dayClosed
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-accent-soft text-accent-dark ring-1 ring-accent/30 hover:bg-accent/20'
        }`}
      >
        Όλη μέρα {rangeLabel(ALL_DAY_RANGE)}
        <span className="mt-0.5 block text-[11px] font-semibold opacity-80">
          {dayPassed ? 'Πέρασε' : dayClosed ? 'Κλειστή' : 'Ανοιχτή'}
        </span>
      </button>
      <p className="text-xs text-zinc-500">
        Τα slots μένουν ανοιχτά μέχρι να τα κλείσεις εδώ. Μόνα τους κλείνουν μόνο όταν περάσει η ώρα
        τους.
      </p>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
