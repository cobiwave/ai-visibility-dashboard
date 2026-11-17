import 'server-only';

import type { Scan } from '@/features/prompts/types';
import { sleep } from '@/server/db';

export const SCAN_QUEUED_MS = 500;
export const SCAN_DURATION_MS = 8000;

// The id carries the start time ("scan_1763380800000"), so the scan needs no
// server-side storage. On Vercel each poll may hit a different instance with
// an empty memory; any instance can rebuild the scan's state from the id alone.
export const SCAN_ID_PATTERN = /^scan_(\d{13})$/;

export function toScanId(startedAtMs: number): string {
  return `scan_${String(startedAtMs)}`;
}

/** Returns the start time in ms, or null for ids this server didn't issue. */
export function parseScanId(id: string): number | null {
  const match = SCAN_ID_PATTERN.exec(id);
  return match?.[1] ? Number(match[1]) : null;
}

/**
 * Pure: a scan's state is a function of elapsed time, so there are no timers
 * to clean up and tests can pass any `now`.
 */
export function scanAt(id: string, startedAt: string, now: number): Scan {
  const elapsed = now - Date.parse(startedAt);

  if (elapsed < SCAN_QUEUED_MS) {
    return { id, startedAt, status: 'queued', progress: 0 };
  }

  if (elapsed >= SCAN_DURATION_MS) {
    return { id, startedAt, status: 'done', progress: 1 };
  }

  return { id, startedAt, status: 'running', progress: elapsed / SCAN_DURATION_MS };
}

/** Null when the id is malformed or claims to start in the future. */
export async function getScan(id: string, now = Date.now()): Promise<Scan | null> {
  await sleep();
  const startedAtMs = parseScanId(id);
  if (startedAtMs === null || startedAtMs > now) return null;
  return scanAt(id, new Date(startedAtMs).toISOString(), now);
}
