export function slotStartTime(timeSlot: string): string {
  const match = timeSlot.match(/^(\d{1,2}:\d{2})/);
  if (!match) {
    return '09:00';
  }
  const [hours, minutes] = match[1].split(':');
  return `${hours.padStart(2, '0')}:${minutes}`;
}

export function normalizeArrivalTime(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function isArrivalTime(value: string): boolean {
  return normalizeArrivalTime(value) !== null;
}

const CYPRUS_TZ = 'Europe/Nicosia';

function offsetMsAt(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return asUtc - instant.getTime();
}

function arrivalInstant(serviceDate: string, arrivalTime: string): Date | null {
  const time = normalizeArrivalTime(arrivalTime);
  if (!time) {
    return null;
  }
  const [year, month, day] = serviceDate.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if (![year, month, day, hour, minute].every((n) => Number.isFinite(n))) {
    return null;
  }
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let instant = utcGuess - offsetMsAt(new Date(utcGuess), CYPRUS_TZ);
  instant = Date.UTC(year, month - 1, day, hour, minute, 0) - offsetMsAt(new Date(instant), CYPRUS_TZ);
  return new Date(instant);
}

function hoursUntilPhrase(serviceDate: string, arrivalTime: string): string | null {
  const arrival = arrivalInstant(serviceDate, arrivalTime);
  if (!arrival) {
    return null;
  }
  const diffMs = arrival.getTime() - Date.now();
  if (diffMs <= 0) {
    return null;
  }
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) {
    return 'σε λιγότερο από μία ώρα';
  }
  if (hours === 1) {
    return 'σε 1 ώρα';
  }
  return `σε ${hours} ώρες`;
}

export function arrivalPushCopy(serviceDate: string, arrivalTime: string) {
  const dateLabel = new Date(`${serviceDate}T12:00:00`).toLocaleDateString('el-GR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const hours = hoursUntilPhrase(serviceDate, arrivalTime);
  return {
    title: 'Η καθαρίστρια έρχεται',
    body: hours
      ? `${hours.charAt(0).toUpperCase()}${hours.slice(1)}, ${dateLabel} στις ${arrivalTime}, θα είναι εκεί η καθαρίστρια.`
      : `Στις ${dateLabel} στις ${arrivalTime} θα είναι εκεί η καθαρίστρια.`,
  };
}

export function completedPushCopy() {
  return {
    title: 'Η κράτησή σου ολοκληρώθηκε!',
    body: 'Συγχαρητήρια — αξιολόγησε την επίσκεψη και άφησε tip αν θέλεις.',
  };
}
