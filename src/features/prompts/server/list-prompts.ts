import 'server-only';

import type { Paginated, Prompt, PromptFilters, PromptRow } from '@/features/prompts/types';
import { getAnswers, getPrompts, sleep } from '@/server/db';
import { SENTIMENTS, type EngineId, type Sentiment } from '@/shared/config/domain';

export const PAGE_SIZE = 10;

/** The answer fields the table aggregates. Kept structural so tests can pass plain objects. */
export interface AnswerFacts {
  promptId: string;
  engine: EngineId;
  mentioned: boolean;
  position: number | null;
  sentiment: Sentiment | null;
}

function dominantSentiment(answers: AnswerFacts[]): Sentiment | null {
  let best: Sentiment | null = null;
  let bestCount = 0;

  // SENTIMENTS order breaks ties: positive > neutral > negative.
  for (const sentiment of SENTIMENTS) {
    const count = answers.filter((answer) => answer.sentiment === sentiment).length;
    if (count > bestCount) {
      best = sentiment;
      bestCount = count;
    }
  }

  return best;
}

function toRow(prompt: Prompt, answers: AnswerFacts[]): PromptRow {
  const positions = answers
    .map((answer) => answer.position)
    .filter((position) => position !== null);

  return {
    ...prompt,
    mentions: answers.filter((answer) => answer.mentioned).length,
    engineCount: answers.length,
    avgPosition:
      positions.length === 0
        ? null
        : positions.reduce((sum, position) => sum + position, 0) / positions.length,
    dominantSentiment: dominantSentiment(answers),
  };
}

/**
 * Pure: filter, aggregate and paginate.
 * - `engine` scopes the aggregates to that engine's answer (mentions become x/1).
 * - `mentioned` keeps prompts with at least one mention (true) or none (false)
 *   among the answers in scope.
 * - Pages are 1-based; a page past the end returns no items but the real total.
 */
export function queryPrompts(
  prompts: Prompt[],
  answers: AnswerFacts[],
  filters: PromptFilters,
  pageSize = PAGE_SIZE,
): Paginated<PromptRow> {
  const answersByPrompt = new Map<string, AnswerFacts[]>();
  for (const answer of answers) {
    if (filters.engine !== undefined && answer.engine !== filters.engine) continue;
    answersByPrompt.set(answer.promptId, [...(answersByPrompt.get(answer.promptId) ?? []), answer]);
  }

  const rows = prompts
    .filter((prompt) => filters.topic === undefined || prompt.topic === filters.topic)
    .map((prompt) => toRow(prompt, answersByPrompt.get(prompt.id) ?? []))
    .filter((row) => filters.mentioned === undefined || row.mentions > 0 === filters.mentioned);

  const page = Math.max(1, Math.floor(filters.page));
  const start = (page - 1) * pageSize;

  return {
    items: rows.slice(start, start + pageSize),
    page,
    pageSize,
    total: rows.length,
  };
}

export async function listPrompts(filters: PromptFilters): Promise<Paginated<PromptRow>> {
  await sleep();
  return queryPrompts(getPrompts(), getAnswers(), filters);
}
