import 'server-only';

import { scanAt, toScanId } from '@/features/prompts/server/get-scan';
import type { Scan } from '@/features/prompts/types';
import { sleep } from '@/server/db';

/** Stateless: nothing is stored, the id itself records when the scan started. */
export async function startScan(now = Date.now()): Promise<Scan> {
  await sleep();
  return scanAt(toScanId(now), new Date(now).toISOString(), now);
}
