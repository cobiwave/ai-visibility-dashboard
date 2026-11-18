'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import { setTracked } from '@/features/prompts/server/set-tracked';
import { DEMO_BRAND_ID } from '@/shared/config/brand';
import { cacheTags } from '@/shared/config/cache-tags';

const inputSchema = z.object({
  promptId: z.string().regex(/^p_\d{3}$/),
  tracked: z.boolean(),
  // Set by the "Simulate failures" switch so the optimistic rollback can be
  // demoed on demand. Deterministic: a live demo can't depend on luck.
  simulateFailure: z.boolean(),
});

export type ToggleTrackedResult =
  | { ok: true; promptId: string; tracked: boolean }
  | { ok: false; error: 'invalid_input' | 'not_found' | 'simulated_failure' };

/**
 * A Server Action is a public POST endpoint, so the input is validated like
 * any request body. Errors are returned as codes, not thrown: production
 * redacts thrown messages, and the client translates the code anyway
 * (next/root-params, and so the locale, isn't available in actions).
 */
export async function toggleTracked(input: {
  promptId: string;
  tracked: boolean;
  simulateFailure: boolean;
}): Promise<ToggleTrackedResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  if (parsed.data.simulateFailure) return { ok: false, error: 'simulated_failure' };

  const prompt = await setTracked(parsed.data.promptId, parsed.data.tracked);
  if (!prompt) return { ok: false, error: 'not_found' };

  // Read-your-own-writes for anything cached under this tag: the next read
  // blocks on fresh data instead of serving stale.
  updateTag(cacheTags.prompts(DEMO_BRAND_ID));
  // The detail page shows the ★ too, from its own cached entry.
  updateTag(cacheTags.prompt(prompt.id));

  return { ok: true, promptId: prompt.id, tracked: prompt.tracked };
}
