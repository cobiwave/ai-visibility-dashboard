import type { PromptFilters } from '@/features/prompts/types';

/**
 * Every React Query key for this feature comes from here, on the server
 * (prefetch) and on the client (useQuery, invalidation). Keys are nested so
 * `lists()` matches every filtered page at once when invalidating.
 */
export const promptKeys = {
  all: ['prompts'] as const,
  lists: () => [...promptKeys.all, 'list'] as const,
  list: (filters: PromptFilters) => [...promptKeys.lists(), filters] as const,
  scans: () => [...promptKeys.all, 'scan'] as const,
  scan: (id: string) => [...promptKeys.scans(), id] as const,
};
