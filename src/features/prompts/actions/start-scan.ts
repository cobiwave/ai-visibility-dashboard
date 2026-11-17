'use server';

import { startScan } from '@/features/prompts/server/start-scan';
import type { Scan } from '@/features/prompts/types';

export async function startScanAction(): Promise<Scan> {
  return startScan();
}
