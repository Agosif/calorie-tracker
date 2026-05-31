import { describe, expect, test } from 'vitest';
import { dayBoundsUtc, formatDateKey, parseDateKey, todayKey } from '@/lib/date';

describe('formatDateKey', () => {
  test('returns YYYY-MM-DD in Europe/Bratislava', () => {
    // 2026-05-31 13:00 UTC = 2026-05-31 15:00 Bratislava (CEST = +2)
    const d = new Date('2026-05-31T13:00:00Z');
    expect(formatDateKey(d)).toBe('2026-05-31');
  });

  test('rolls to next day when UTC late but local is past midnight', () => {
    // 2026-05-31 23:30 UTC = 2026-06-01 01:30 Bratislava
    const d = new Date('2026-05-31T23:30:00Z');
    expect(formatDateKey(d)).toBe('2026-06-01');
  });

  test('rolls to previous day when UTC early but local is still previous day', () => {
    // 2026-01-15 00:30 UTC = 2026-01-15 01:30 Bratislava (CET = +1) — same day
    // 2026-01-01 23:30 UTC = 2026-01-02 00:30 Bratislava — next day
    expect(formatDateKey(new Date('2026-01-01T23:30:00Z'))).toBe('2026-01-02');
  });
});

describe('dayBoundsUtc', () => {
  test('summer date returns CEST boundaries (UTC-2)', () => {
    const { start, end } = dayBoundsUtc('2026-05-31');
    // 2026-05-31 00:00 Bratislava CEST = 2026-05-30 22:00 UTC
    expect(start.toISOString()).toBe('2026-05-30T22:00:00.000Z');
    expect(end.toISOString()).toBe('2026-05-31T22:00:00.000Z');
  });

  test('winter date returns CET boundaries (UTC-1)', () => {
    const { start, end } = dayBoundsUtc('2026-01-15');
    expect(start.toISOString()).toBe('2026-01-14T23:00:00.000Z');
    expect(end.toISOString()).toBe('2026-01-15T23:00:00.000Z');
  });

  test('start is before end and exactly 24 hours apart outside DST transitions', () => {
    const { start, end } = dayBoundsUtc('2026-07-15');
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
  });
});

describe('parseDateKey + formatDateKey roundtrip', () => {
  test('formatDateKey(parseDateKey(k)) === k', () => {
    for (const k of ['2026-01-15', '2026-05-31', '2026-07-15', '2026-12-31']) {
      expect(formatDateKey(parseDateKey(k))).toBe(k);
    }
  });
});

describe('todayKey', () => {
  test('returns a YYYY-MM-DD string', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
