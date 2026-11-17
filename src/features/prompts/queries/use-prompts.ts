'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPrompts } from '@/features/prompts/queries/api';
import { promptKeys } from '@/features/prompts/queries/keys';
import type { PromptFilters } from '@/features/prompts/types';

/**
 * Same key the server prefetched with, so on first paint the data is already
 * in the cache (hydrated) and no request is made. When the filters change,
 * `keepPreviousData` keeps showing the old page until the new one arrives.
 */
export function usePrompts(filters: PromptFilters) {
  return useQuery({
    queryKey: promptKeys.list(filters),
    queryFn: () => fetchPrompts(filters),
    placeholderData: keepPreviousData,
  });
}
