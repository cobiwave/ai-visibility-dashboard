import 'server-only';

import { scanAt } from '@/features/prompts/server/get-scan';
import type { Scan } from '@/features/prompts/types';
import { insertScan, sleep } from '@/server/db';

export async function startScan(now = Date.now()): Promise<Scan> {
  await sleep();
  const record = insertScan(new Date(now).toISOString());
  return scanAt(record.id, record.startedAt, now);
}
