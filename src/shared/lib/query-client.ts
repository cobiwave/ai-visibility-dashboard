import { environmentManager, QueryClient } from '@tanstack/react-query';

/** Lists are fresh for 30 s: no refetch on mount right after hydration. */
export const LIST_STALE_TIME_MS = 30_000;

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: LIST_STALE_TIME_MS } },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Server: a new client per call, so one request's data never leaks into
 * another's. Browser: one client for the whole session, so the cache survives
 * re-renders and navigations (and a suspending render can't throw it away).
 */
export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
