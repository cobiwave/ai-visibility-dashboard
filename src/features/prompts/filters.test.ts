import { describe, expect, it } from 'vitest';
import { filtersToSearchParams, parsePromptFilters } from './filters';

describe('parsePromptFilters', () => {
  it('parses valid values', () => {
    expect(
      parsePromptFilters({ engine: 'claude', topic: 'price', mentioned: 'false', page: '2' }),
    ).toEqual({ engine: 'claude', topic: 'price', mentioned: false, page: 2 });
  });

  it('returns defaults when everything is missing', () => {
    expect(parsePromptFilters({})).toEqual({ page: 1 });
  });

  it('falls back per field for invalid values', () => {
    expect(parsePromptFilters({ engine: 'bing', topic: 'price', mentioned: 'yes' })).toEqual({
      topic: 'price',
      page: 1,
    });
  });

  it.each(['0', '-3', '1.5', 'abc', '', '99999'])('falls back to page 1 for page=%j', (page) => {
    expect(parsePromptFilters({ page })).toEqual({ page: 1 });
  });

  it('takes the first value of a repeated param', () => {
    expect(parsePromptFilters({ topic: ['brand', 'price'] })).toEqual({ topic: 'brand', page: 1 });
  });

  it('reads URLSearchParams the same way as a searchParams object', () => {
    const query = 'topic=price&page=2&mentioned=true';

    expect(parsePromptFilters(new URLSearchParams(query))).toEqual(
      parsePromptFilters({ topic: 'price', page: '2', mentioned: 'true' }),
    );
  });
});

describe('filtersToSearchParams', () => {
  it('omits defaults', () => {
    expect(filtersToSearchParams({ page: 1 }).toString()).toBe('');
  });

  it('round-trips through parsePromptFilters', () => {
    const filters = { engine: 'gemini', mentioned: true, page: 3 } as const;

    expect(parsePromptFilters(filtersToSearchParams(filters))).toEqual(filters);
  });
});
