import type { Answer } from '@/features/answers/types';

/**
 * The prompt ids with the most brand mentions across engines, best first.
 * Ties break by id so the result (and so the set of prerendered pages) is the
 * same on every build.
 */
export function topPromptIdsByMentions(
  answers: Pick<Answer, 'promptId' | 'mentioned'>[],
  limit: number,
): string[] {
  const mentionsById = new Map<string, number>();
  for (const { promptId, mentioned } of answers) {
    mentionsById.set(promptId, (mentionsById.get(promptId) ?? 0) + (mentioned ? 1 : 0));
  }

  return [...mentionsById]
    .toSorted(([idA, a], [idB, b]) => b - a || idA.localeCompare(idB))
    .slice(0, limit)
    .map(([id]) => id);
}
