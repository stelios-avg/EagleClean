import type { CrewService, HomeSize } from '../navigation/types';

/**
 * Base visit duration in hours per service:
 * regular home cleaning books in 2-hour slots, deep cleaning in 3-hour
 * slots, events in 4-hour slots. Extra hours can be added on top.
 */
export const BASE_DURATION_HOURS: Record<HomeSize | CrewService, number> = {
  Studio: 2,
  '1 Bedroom': 2,
  '2 Bedroom': 2,
  '3 Bedroom': 2,
  'Deep Cleaning': 3,
  Events: 4,
};

export const DEFAULT_DURATION_HOURS = 2;

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 18;
/** Extra hours may push the end of a visit up to this hour. */
const LATEST_END_HOUR = 20;
export const MAX_EXTRA_HOURS = 4;

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** e.g. slotLabel(8, 3) -> "08:00 - 11:00" */
export function slotLabel(startHour: number, durationHours: number): string {
  return `${formatHour(startHour)} - ${formatHour(startHour + durationHours)}`;
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
