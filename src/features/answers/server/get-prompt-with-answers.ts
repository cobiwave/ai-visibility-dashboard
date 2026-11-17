import 'server-only';

import type { PromptWithAnswers } from '@/features/answers/types';
import { getAnswersForPrompt, getPrompt, sleep } from '@/server/db';
import { ENGINE_IDS } from '@/shared/config/domain';

/** Returns null for unknown ids so the page can call notFound(). */
export async function getPromptWithAnswers(promptId: string): Promise<PromptWithAnswers | null> {
  await sleep();
  const prompt = getPrompt(promptId);
  if (!prompt) return null;

  const answers = getAnswersForPrompt(promptId).toSorted(
    (a, b) => ENGINE_IDS.indexOf(a.engine) - ENGINE_IDS.indexOf(b.engine),
  );

  return {
    prompt: { id: prompt.id, text: prompt.text, topic: prompt.topic },
    answers,
  };
}
