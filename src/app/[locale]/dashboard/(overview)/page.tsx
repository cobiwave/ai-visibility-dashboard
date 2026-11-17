import { getLocale, getTranslations } from 'next-intl/server';
import { EngineBreakdown } from '@/features/visibility/components/EngineBreakdown';
import { KpiCards } from '@/features/visibility/components/KpiCards';
import { TrendChart } from '@/features/visibility/components/TrendChart';
import { getOverview } from '@/features/visibility/server/get-overview';
import { DEMO_BRAND_ID } from '@/shared/config/brand';
import { formatDateTime } from '@/shared/lib/format';

// Static shell + ISR data: getOverview is a tagged 'use cache' function, so the
// whole page is prerendered and regenerated when the tag is revalidated.
export default async function OverviewPage() {
  const t = await getTranslations('Overview');
  const locale = await getLocale();
  const overview = await getOverview(DEMO_BRAND_ID);

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <p className="text-text-muted text-sm">
          {overview.brand.name} ·{' '}
          <time dateTime={overview.generatedAt}>
            {t('generatedAt', { time: formatDateTime(overview.generatedAt, locale) })}
          </time>
        </p>
      </header>
      <KpiCards kpis={overview.kpis} />
      <TrendChart series={overview.series} />
      <EngineBreakdown engines={overview.engines} />
    </>
  );
}
