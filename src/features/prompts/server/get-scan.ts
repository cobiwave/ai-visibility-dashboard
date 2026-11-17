import 'server-only';

import type { Scan } from '@/features/prompts/types';
import { findScan, sleep } from '@/server/db';

export const SCAN_QUEUED_MS = 500;
export const SCAN_DURATION_MS = 8000;

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

export async function getScan(id: string, now = Date.now()): Promise<Scan | null> {
  await sleep();
  const record = findScan(id);
  return record ? scanAt(record.id, record.startedAt, now) : null;
}
