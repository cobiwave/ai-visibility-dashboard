import { getLocale, getTranslations } from 'next-intl/server';
import type { EngineBreakdown as EngineBreakdownRow } from '@/features/visibility/types';
import { ENGINE_IDS, type EngineId } from '@/shared/config/domain';
import { ENGINE_LABELS } from '@/shared/config/engines';
import { cn } from '@/shared/lib/cn';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ENGINE_TEXT_COLOR } from '@/shared/ui/engine-color';

function EngineName({ engine }: { engine: EngineId }) {
  return <span className="w-28 shrink-0 text-sm font-medium">{ENGINE_LABELS[engine]}</span>;
}

export async function EngineBreakdown({ engines }: { engines: EngineBreakdownRow[] }) {
  const t = await getTranslations('Overview.engines');
  const locale = await getLocale();
  const rows = engines.toSorted((a, b) => b.visibilityScore - a.visibilityScore);

  return (
    <Card aria-labelledby="engine-breakdown-heading" className="flex flex-col gap-4">
      <h2 id="engine-breakdown-heading" className="text-lg font-semibold">
        {t('title')}
      </h2>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.engine} className="flex items-center gap-3">
            <EngineName engine={row.engine} />
            {/* The bar is decorative: the score is also in the text next to it. */}
            <div aria-hidden className="bg-surface-3 h-2 flex-1 overflow-hidden rounded-full">
              <div
                className={cn('h-full rounded-full bg-current', ENGINE_TEXT_COLOR[row.engine])}
                // Data-driven width can't be a token; an inline style is the honest tool here.
                style={{ width: `${String(row.visibilityScore)}%` }}
              />
            </div>
            <span className="w-10 text-right text-sm font-semibold tabular-nums">
              {formatNumber(row.visibilityScore, locale)}
            </span>
            <span className="text-text-muted hidden w-64 text-right text-xs whitespace-nowrap tabular-nums sm:block">
              {t('details', {
                shareOfVoice: formatPercent(row.shareOfVoice, locale),
                position:
                  row.avgPosition === null ? t('notRanked') : formatNumber(row.avgPosition, locale),
              })}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export async function EngineBreakdownSkeleton() {
  const t = await getTranslations('Overview.engines');

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <ul className="flex flex-col gap-3">
        {ENGINE_IDS.map((engine) => (
          <li key={engine} className="flex h-5 items-center gap-3">
            <EngineName engine={engine} />
            <Skeleton className="h-2 flex-1 rounded-full" />
            <span className="w-10" />
            <span className="hidden w-64 sm:block" />
          </li>
        ))}
      </ul>
    </Card>
  );
}
