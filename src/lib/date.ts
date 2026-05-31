const TZ = 'Europe/Bratislava';

export function formatDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function dayBoundsUtc(key: string): { start: Date; end: Date } {
  const [y, m, d] = key.split('-').map(Number);
  const start = zonedMidnightUtc(y, m, d);
  const end = zonedMidnightUtc(y, m, d + 1);
  return { start, end };
}

export function parseDateKey(key: string): Date {
  return dayBoundsUtc(key).start;
}

export function todayKey(): string {
  return formatDateKey(new Date());
}

function zonedMidnightUtc(y: number, m: number, d: number): Date {
  const naive = Date.UTC(y, m - 1, d);
  const localStr = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(naive));
  const [datePart, timePart] = localStr.split(', ');
  const [mm, dd, yyyy] = datePart.split('/').map(Number);
  const [hh, mi, ss] = timePart.split(':').map(Number);
  const seenUtc = Date.UTC(yyyy, mm - 1, dd, hh % 24, mi, ss);
  const offsetMs = seenUtc - naive;
  return new Date(naive - offsetMs);
}
