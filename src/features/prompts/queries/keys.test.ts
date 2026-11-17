import { hashKey, matchQuery, QueryCache, QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { parsePromptFilters } from '@/features/prompts/filters';
import { promptKeys } from './keys';

describe('promptKeys', () => {
  it('nests list and scan keys under the feature root', () => {
    expect(promptKeys.list({ topic: 'price', page: 2 })).toEqual([
      'prompts',
      'list',
      { topic: 'price', page: 2 },
    ]);
    expect(promptKeys.scan('scan_1')).toEqual(['prompts', 'scan', 'scan_1']);
  });

  it('gives the server and client the same hash for the same URL', () => {
    // Server: the searchParams object. Client: useSearchParams(). Same key.
    const fromServer = promptKeys.list(parsePromptFilters({ page: '2', topic: 'price' }));
    const fromClient = promptKeys.list(
      parsePromptFilters(new URLSearchParams('topic=price&page=2')),
    );

    expect(hashKey(fromServer)).toBe(hashKey(fromClient));
  });

  it('lists() matches every list but no scan', () => {
    const cache = new QueryCache();
    const client = new QueryClient({ queryCache: cache });
    client.setQueryData(promptKeys.list({ page: 1 }), 'a');
    client.setQueryData(promptKeys.list({ topic: 'brand', page: 3 }), 'b');
    client.setQueryData(promptKeys.scan('scan_1'), 'c');

    const matched = cache
      .getAll()
      .filter((query) => matchQuery({ queryKey: promptKeys.lists() }, query));

    expect(matched.map((query) => query.state.data)).toEqual(['a', 'b']);
  });
});
