import { describe, expect, it } from 'vitest';
import { topPromptIdsByMentions } from './top-prompts';

const answer = (promptId: string, mentioned: boolean) => ({ promptId, mentioned });

describe('topPromptIdsByMentions', () => {
  it('orders by mention count, highest first', () => {
    const answers = [
      answer('p_001', true),
      answer('p_002', true),
      answer('p_002', true),
      answer('p_003', true),
      answer('p_003', true),
      answer('p_003', true),
    ];

    expect(topPromptIdsByMentions(answers, 3)).toEqual(['p_003', 'p_002', 'p_001']);
  });

  it('counts only answers that mention the brand', () => {
    const answers = [
      answer('p_001', false),
      answer('p_001', false),
      answer('p_001', false),
      answer('p_002', true),
    ];

    expect(topPromptIdsByMentions(answers, 1)).toEqual(['p_002']);
  });

  it('breaks ties by id so builds are deterministic', () => {
    const answers = [answer('p_009', true), answer('p_002', true), answer('p_005', true)];

    expect(topPromptIdsByMentions(answers, 3)).toEqual(['p_002', 'p_005', 'p_009']);
  });

  it('returns at most `limit` ids, and every prompt when there are fewer', () => {
    const answers = [answer('p_001', true), answer('p_002', false)];

    expect(topPromptIdsByMentions(answers, 1)).toHaveLength(1);
    expect(topPromptIdsByMentions(answers, 20)).toEqual(['p_001', 'p_002']);
    expect(topPromptIdsByMentions([], 20)).toEqual([]);
  });
});
