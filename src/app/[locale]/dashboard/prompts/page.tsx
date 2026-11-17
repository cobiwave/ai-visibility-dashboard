import { dehydrate, HydrationBoundary, noop } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { FiltersBar } from '@/features/prompts/components/FiltersBar';
import { PromptsSkeleton } from '@/features/prompts/components/PromptsSkeleton';
import { PromptsTable } from '@/features/prompts/components/PromptsTable';
import { ScanButton } from '@/features/prompts/components/ScanButton';
import { parsePromptFilters } from '@/features/prompts/filters';
import { promptKeys } from '@/features/prompts/queries/keys';
import { listPrompts } from '@/features/prompts/server/list-prompts';
import { getBrand } from '@/server/db';
import { getQueryClient } from '@/shared/lib/query-client';
import { QueryProvider } from '@/shared/ui/QueryProvider';

/**
 * The dynamic hole. It reads searchParams (request-time data), so it renders
 * per request inside Suspense. It calls the data function directly (no HTTP
 * hop to our own API) under the same key the client uses, then hands the
 * cache to the browser: first paint has rows and the client makes no request.
 */
async function PromptsResults({
  searchParams,
}: Pick<PageProps<'/[locale]/dashboard/prompts'>, 'searchParams'>) {
  const filters = parsePromptFilters(await searchParams);
  const queryClient = getQueryClient();

  // `query().catch(noop)` is the non-deprecated prefetch in this React Query
  // version. On failure nothing is dehydrated and the client fetches instead.
  await queryClient
    .query({ queryKey: promptKeys.list(filters), queryFn: () => listPrompts(filters) })
    .catch(noop);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-4">
        <FiltersBar />
        <PromptsTable />
      </div>
    </HydrationBoundary>
  );
}

// Partial prerendering: everything outside <Suspense> (header, scan button,
// skeleton) is the static shell; the results stream in per request.
export default async function PromptsPage({
  searchParams,
}: PageProps<'/[locale]/dashboard/prompts'>) {
  const t = await getTranslations('Prompts');

  return (
    <QueryProvider>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">{t('title')}</h1>
          <p className="text-text-muted text-sm">{t('subtitle', { brand: getBrand().name })}</p>
        </div>
        <ScanButton />
      </header>
      <Suspense fallback={<PromptsSkeleton />}>
        <PromptsResults searchParams={searchParams} />
      </Suspense>
    </QueryProvider>
  );
}
