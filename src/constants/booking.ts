import type { BookingOption } from '../navigation/types';

/**
 * Base visit duration in hours per service:
 * regular home cleaning books in 2-hour slots, deep cleaning in 3-hour
 * slots, events in 4-hour slots. Extra hours can be added on top.
 */
export const BASE_DURATION_HOURS: Record<BookingOption, number> = {
  Studio: 2,
  '1 Bedroom': 2,
  '2 Bedroom': 2,
  '3 Bedroom': 2,
  'Deep Cleaning': 3,
  Events: 4,
  Ironing: 2,
};

export const DEFAULT_DURATION_HOURS = 2;

/** €13 per hour for home cleaning. Deep €18. Events €16. */
export const HOUR_RATE_CENTS = 1300;
export const DEEP_HOUR_RATE_CENTS = 1800;
export const EVENTS_HOUR_RATE_CENTS = 1600;
export const EXTRA_HOUR_PRICE_CENTS = HOUR_RATE_CENTS;

export function hourRateCents(option: BookingOption): number {
  if (option === 'Events') {
    return EVENTS_HOUR_RATE_CENTS;
  }
  if (option === 'Deep Cleaning') {
    return DEEP_HOUR_RATE_CENTS;
  }
  return HOUR_RATE_CENTS;
}

export const DAY_START_HOUR = 8;
const DAY_END_HOUR = 18;
/** Extra hours may push the end of a visit up to this hour. */
export const LATEST_END_HOUR = 20;
/** Full working day: 08:00–20:00. */
export const ALL_DAY_DURATION_HOURS = LATEST_END_HOUR - DAY_START_HOUR;
export const MAX_EXTRA_HOURS = 4;

/** Extra hours billed when the customer picks the all-day slot. */
export function allDayExtraHours(baseDuration: number): number {
  return Math.max(0, ALL_DAY_DURATION_HOURS - baseDuration);
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** e.g. slotLabel(8, 3) -> "08:00 - 11:00" */
export function slotLabel(startHour: number, durationHours: number): string {
  return `${formatHour(startHour)} - ${formatHour(startHour + durationHours)}`;
}

/** Hours covered by a stored slot label such as "10:00 - 13:00". */
export function slotDurationHours(timeSlot: string): number | null {
  const match = timeSlot.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  const minutes = end - start;
  if (minutes <= 0) {
    return null;
  }
  return minutes / 60;
}

/** Non-overlapping start hours within the working day for a given duration. */
export function getSlotStartHours(durationHours: number): number[] {
  const starts: number[] = [];
  for (let h = DAY_START_HOUR; h + durationHours <= DAY_END_HOUR; h += durationHours) {
    starts.push(h);
  }
  return starts;
}

/** How many extra hours can be added to a slot before hitting the day cap. */
export function maxExtraHoursFor(startHour: number, durationHours: number): number {
  return Math.max(0, Math.min(MAX_EXTRA_HOURS, LATEST_END_HOUR - (startHour + durationHours)));
}

/** An admin-closed time range on a given day. */
export type BookedRange = { start_hour: number; end_hour: number };

/** True when a candidate slot overlaps any closed window of the day. */
export function isSlotTaken(
  startHour: number,
  durationHours: number,
  booked: BookedRange[]
): boolean {
  const end = startHour + durationHours;
  return booked.some((b) => startHour < b.end_hour && end > b.start_hour);
}

/** Same-day slots whose start time has already passed are not bookable. */
export function isSlotStartPassed(
  isoDate: string,
  startHour: number,
  now = new Date()
): boolean {
  const [year, month, day] = isoDate.split('-').map(Number);
  const start = new Date(year, month - 1, day, startHour, 0, 0, 0);
  return now.getTime() >= start.getTime();
}

/** All-day is free only when the admin has not closed 08:00–20:00 and 08:00 has not passed. */
export function isAllDayTaken(
  isoDate: string,
  booked: BookedRange[],
  now?: Date
): boolean {
  return (
    isSlotTaken(DAY_START_HOUR, ALL_DAY_DURATION_HOURS, booked) ||
    isSlotStartPassed(isoDate, DAY_START_HOUR, now)
  );
}

/**
 * Extra-hours cap that also respects later closed windows, so an
 * extended visit never runs into a slot the admin has shut.
 */
export function maxExtraHoursWithBookings(
  startHour: number,
  durationHours: number,
  booked: BookedRange[]
): number {
  const baseEnd = startHour + durationHours;
  let cap = maxExtraHoursFor(startHour, durationHours);
  for (const b of booked) {
    if (b.start_hour >= baseEnd) {
      cap = Math.min(cap, b.start_hour - baseEnd);
    }
  }
  return Math.max(0, cap);
}
