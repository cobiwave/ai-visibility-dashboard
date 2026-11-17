import 'server-only';

import type { Prompt } from '@/features/prompts/types';
import { getPrompt, sleep, writeTracked } from '@/server/db';

/** Returns the updated prompt, or null when the id doesn't exist. */
export async function setTracked(promptId: string, tracked: boolean): Promise<Prompt | null> {
  await sleep();
  return writeTracked(promptId, tracked) ? getPrompt(promptId) : null;
}
