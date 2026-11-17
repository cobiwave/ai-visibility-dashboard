import type { Locale } from '@/shared/config/locale';

// All number and date formatting goes through native Intl, with the locale
// passed in explicitly. Nothing here reads the request, so it is safe to call
// from cached functions, Server Components and Client Components alike.

/** 0.314 → "31.4%" (en) / "31,4 %" (es). Expects a ratio in [0, 1]. */
export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
    value,
  );
}

/** 12345 → "12.3K" (en) / "12,3 mil" (es). */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

/**
 * "2026-11-16" → "Nov 16, 2026" (en) / "16 nov 2026" (es).
 * Uses UTC so a YYYY-MM-DD date doesn't shift a day in negative-offset time
 * zones, and so server and client render the same text (no hydration mismatch).
 */
export function formatDate(date: Date | string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(date),
  );
}

const SECOND_MS = 1000;
const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * SECOND_MS },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * SECOND_MS },
  { unit: 'day', ms: 24 * 60 * 60 * SECOND_MS },
  { unit: 'hour', ms: 60 * 60 * SECOND_MS },
  { unit: 'minute', ms: 60 * SECOND_MS },
];

/**
 * "2 hours ago" / "hace 2 horas", using the largest unit that fits.
 * `now` is injectable so tests don't depend on the clock.
 */
export function formatRelativeTime(
  date: Date | string,
  locale: Locale,
  now: number = Date.now(),
): string {
  const diff = new Date(date).getTime() - now;
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const match = UNITS.find(({ ms }) => Math.abs(diff) >= ms);

  return match
    ? format.format(Math.round(diff / match.ms), match.unit)
    : format.format(Math.round(diff / SECOND_MS), 'second');
}
