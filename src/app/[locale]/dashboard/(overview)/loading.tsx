import { getTranslations } from 'next-intl/server';
import { EngineBreakdownSkeleton } from '@/features/visibility/components/EngineBreakdown';
import { KpiCardsSkeleton } from '@/features/visibility/components/KpiCards';
import { TrendChartSkeleton } from '@/features/visibility/components/TrendChart';
import { Skeleton } from '@/shared/ui/Skeleton';

// Lives in the (overview) route group so it only wraps the overview page,
// not /dashboard/prompts. Mirrors page.tsx block by block (same cards, paddings and line heights),
// so swapping in the real content causes no layout shift.
export default async function OverviewLoading() {
  const t = await getTranslations('Overview');

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <Skeleton className="my-0.5 h-4 w-80" />
      </header>
      <KpiCardsSkeleton />
      <TrendChartSkeleton />
      <EngineBreakdownSkeleton />
    </>
  );
}
