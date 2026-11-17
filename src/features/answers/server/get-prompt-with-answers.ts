import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import type { PromptWithAnswers } from '@/features/answers/types';
import { getAnswersForPrompt, getPrompt, sleep } from '@/server/db';
import { cacheTags } from '@/shared/config/cache-tags';
import { ENGINE_IDS } from '@/shared/config/domain';

/**
 * ISR per prompt: cached by `promptId` (an argument, so part of the key),
 * stale after an hour, and invalidated by `prompt:{id}` from the ★ action or
 * the revalidate webhook. No `connection()` and no request data in here: the
 * top-20 pages are prerendered at build time through this function.
 *
 * Returns null for unknown ids so the page can call notFound(). The null is
 * cached too, which is fine: ids only change on deploy in this mock.
 */
export async function getPromptWithAnswers(promptId: string): Promise<PromptWithAnswers | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(cacheTags.prompt(promptId));

  await sleep();
  const prompt = getPrompt(promptId);
  if (!prompt) return null;

  const answers = getAnswersForPrompt(promptId).toSorted(
    (a, b) => ENGINE_IDS.indexOf(a.engine) - ENGINE_IDS.indexOf(b.engine),
  );

  return {
    prompt: { id: prompt.id, text: prompt.text, topic: prompt.topic, tracked: prompt.tracked },
    answers,
  };
}
