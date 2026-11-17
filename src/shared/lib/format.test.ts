import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber, formatPercent, formatRelativeTime } from './format';

// Spanish Intl output uses a non-breaking space (U+00A0): "31,4 %", "12,3 mil".
const NBSP = ' ';
const now = Date.parse('2026-11-17T12:00:00.000Z');

describe('formatPercent', () => {
  it('formats in en and es', () => {
    expect(formatPercent(0.314, 'en')).toBe('31.4%');
    expect(formatPercent(0.314, 'es')).toBe(`31,4${NBSP}%`);
  });

  it('drops trailing zeros', () => {
    expect(formatPercent(0.5, 'en')).toBe('50%');
  });
});

describe('formatNumber', () => {
  it('uses compact notation', () => {
    expect(formatNumber(12_345, 'en')).toBe('12.3K');
    expect(formatNumber(12_345, 'es')).toBe(`12,3${NBSP}mil`);
    expect(formatNumber(950, 'en')).toBe('950');
  });
});

describe('formatDate', () => {
  it('formats a YYYY-MM-DD date without shifting the day', () => {
    expect(formatDate('2026-11-16', 'en')).toBe('Nov 16, 2026');
    expect(formatDate('2026-11-16', 'es')).toBe('16 nov 2026');
  });
});

describe('formatRelativeTime', () => {
  it('formats hours in en and es', () => {
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);

    expect(formatRelativeTime(twoHoursAgo, 'en', now)).toBe('2 hours ago');
    expect(formatRelativeTime(twoHoursAgo, 'es', now)).toBe('hace 2 horas');
  });

  it('uses words for yesterday', () => {
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);

    expect(formatRelativeTime(yesterday, 'en', now)).toBe('yesterday');
    expect(formatRelativeTime(yesterday, 'es', now)).toBe('ayer');
  });

  it('falls back to seconds and handles the future', () => {
    expect(formatRelativeTime(new Date(now - 30_000), 'en', now)).toBe('30 seconds ago');
    expect(formatRelativeTime(new Date(now + 3 * 60_000), 'es', now)).toBe('dentro de 3 minutos');
  });
});
