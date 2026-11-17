'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { filtersToSearchParams, parsePromptFilters } from '@/features/prompts/filters';
import type { PromptFilters } from '@/features/prompts/types';

/**
 * The URL is the single source of truth for filters: shareable, survives a
 * reload, and the server reads the same params for the first paint.
 *
 * Updates use the native `history.replaceState`, which Next syncs into
 * `useSearchParams`, instead of `router.replace`. `router.replace` is a Next
 * navigation: it re-renders the page on the server (re-running the prefetch)
 * and only updates the URL hooks once that response arrives, so React Query
 * would never fetch and `keepPreviousData` would never apply. With the history
 * API there is no server round trip: the key changes, React Query fetches
 * /api/prompts and keeps the old rows on screen meanwhile. "Next owns the first
 * paint, React Query owns everything after hydration."
 * `replace` (not `push`) so filter clicks don't pile up history entries.
 */
export function usePromptFilters() {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parsePromptFilters(searchParams), [searchParams]);

  function setFilters(next: PromptFilters) {
    const query = filtersToSearchParams(next).toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  }

  return { filters, setFilters };
}
