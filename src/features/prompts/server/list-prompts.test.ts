import { describe, expect, it } from 'vitest';
import { queryPrompts, type AnswerFacts } from './list-prompts';
import type { Prompt } from '@/features/prompts/types';
import type { EngineId, Topic } from '@/shared/config/domain';

function prompt(id: string, topic: Topic): Prompt {
  return {
    id,
    topic,
    text: { en: id, es: id },
    tracked: false,
    createdAt: '2026-11-01T00:00:00.000Z',
  };
}

function answer(promptId: string, engine: EngineId, position: number | null): AnswerFacts {
  return {
    promptId,
    engine,
    mentioned: position !== null,
    position,
    sentiment: position === null ? null : 'positive',
  };
}

// p1 (price): mentioned by chatgpt (#1) and claude (#3)
// p2 (price): mentioned by nobody
// p3 (delivery): mentioned by claude (#2), negative
const prompts = [prompt('p1', 'price'), prompt('p2', 'price'), prompt('p3', 'delivery')];
const answers: AnswerFacts[] = [
  answer('p1', 'chatgpt', 1),
  answer('p1', 'claude', 3),
  answer('p2', 'chatgpt', null),
  answer('p2', 'claude', null),
  answer('p3', 'chatgpt', null),
  { ...answer('p3', 'claude', 2), sentiment: 'negative' },
];

const ids = (result: ReturnType<typeof queryPrompts>) => result.items.map((row) => row.id);

describe('queryPrompts filters', () => {
  it('returns everything with no filters', () => {
    expect(ids(queryPrompts(prompts, answers, { page: 1 }))).toEqual(['p1', 'p2', 'p3']);
  });

  it('filters by topic', () => {
    expect(ids(queryPrompts(prompts, answers, { topic: 'price', page: 1 }))).toEqual(['p1', 'p2']);
  });

  it('filters by mentioned yes / no', () => {
    expect(ids(queryPrompts(prompts, answers, { mentioned: true, page: 1 }))).toEqual(['p1', 'p3']);
    expect(ids(queryPrompts(prompts, answers, { mentioned: false, page: 1 }))).toEqual(['p2']);
  });

  it('scopes mentions to the selected engine', () => {
    const result = queryPrompts(prompts, answers, { engine: 'chatgpt', mentioned: true, page: 1 });

    expect(ids(result)).toEqual(['p1']);
    expect(result.items[0]).toMatchObject({ mentions: 1, engineCount: 1, avgPosition: 1 });
  });

  it('combines engine, topic and mentioned', () => {
    const result = queryPrompts(prompts, answers, {
      engine: 'claude',
      topic: 'delivery',
      mentioned: true,
      page: 1,
    });

    expect(ids(result)).toEqual(['p3']);
  });

  it('computes the table aggregates', () => {
    const [p1, p2, p3] = queryPrompts(prompts, answers, { page: 1 }).items;

    expect(p1).toMatchObject({
      mentions: 2,
      engineCount: 2,
      avgPosition: 2,
      dominantSentiment: 'positive',
    });
    expect(p2).toMatchObject({ mentions: 0, avgPosition: null, dominantSentiment: null });
    expect(p3).toMatchObject({ mentions: 1, dominantSentiment: 'negative' });
  });
});

describe('queryPrompts pagination', () => {
  it('returns a full first page and a partial last page', () => {
    const first = queryPrompts(prompts, answers, { page: 1 }, 2);
    const last = queryPrompts(prompts, answers, { page: 2 }, 2);

    expect(ids(first)).toEqual(['p1', 'p2']);
    expect(ids(last)).toEqual(['p3']);
    expect(last).toMatchObject({ page: 2, pageSize: 2, total: 3 });
  });

  it('returns no items but the real total past the last page', () => {
    const result = queryPrompts(prompts, answers, { page: 3 }, 2);

    expect(result.items).toEqual([]);
    expect(result.total).toBe(3);
  });

  it('returns an empty result when nothing matches', () => {
    const result = queryPrompts(prompts, answers, { topic: 'brand', page: 1 });

    expect(result).toEqual({ items: [], page: 1, pageSize: 10, total: 0 });
  });

  it('treats page numbers below 1 as page 1', () => {
    expect(queryPrompts(prompts, answers, { page: 0 }).page).toBe(1);
  });
});
