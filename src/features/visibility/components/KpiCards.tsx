import { getLocale, getTranslations } from 'next-intl/server';
import type { Kpi, OverviewKpis } from '@/features/visibility/types';
import { cn } from '@/shared/lib/cn';
import { formatNumber, formatPercent, formatSignedNumber } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';

type Trend = 'better' | 'worse' | 'flat';

/** For average position a lower number is better, so the trend flips. */
function trendOf(delta: number, lowerIsBetter: boolean): Trend {
  if (delta === 0) return 'flat';
  return delta > 0 !== lowerIsBetter ? 'better' : 'worse';
}

const TREND_STYLE: Record<Trend, { color: string; arrow: string }> = {
  better: { color: 'text-success', arrow: '▲' },
  worse: { color: 'text-danger', arrow: '▼' },
  flat: { color: 'text-text-muted', arrow: '■' },
};

interface KpiCardProps {
  label: string;
  value: string;
  /** Formatted delta and its trend, or a muted hint when there is no comparison. */
  delta: { text: string; trend: Trend } | null;
  hint: string;
  trendLabels: Record<Trend, string>;
}

function KpiCard({ label, value, delta, hint, trendLabels }: KpiCardProps) {
  const style = delta ? TREND_STYLE[delta.trend] : null;

  return (
    <Card className="flex flex-col gap-1">
      <h2 className="text-text-muted text-sm">{label}</h2>
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      <p className="text-sm">
        {delta && style ? (
          <>
            <span className={cn('font-medium tabular-nums', style.color)}>
              <span aria-hidden>{style.arrow} </span>
              {delta.text}
              <span className="sr-only"> ({trendLabels[delta.trend]})</span>
            </span>{' '}
          </>
        ) : null}
        <span className="text-text-muted">{hint}</span>
      </p>
    </Card>
  );
}

/**
 * `scale` converts to display units (100 turns a ratio delta into percentage
 * points). The trend is decided on the rounded value, so a delta that displays
 * as "0" is shown as "no change", not as a green arrow.
 */
function deltaOf(
  kpi: Kpi,
  format: (delta: number) => string,
  { scale = 1, lowerIsBetter = false } = {},
) {
  if (kpi.delta === null) return null;
  const shown = Math.round(kpi.delta * scale * 10) / 10;
  return { text: format(shown), trend: trendOf(shown, lowerIsBetter) };
}

export async function KpiCards({ kpis }: { kpis: OverviewKpis }) {
  const t = await getTranslations('Overview.kpis');
  const locale = await getLocale();
  const empty = t('empty');
  const trendLabels = { better: t('better'), worse: t('worse'), flat: t('flat') };
  const vsLastWeek = t('vsLastWeek');

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label={t('visibilityScore')}
        value={
          kpis.visibilityScore.value === null
            ? empty
            : formatNumber(kpis.visibilityScore.value, locale)
        }
        delta={deltaOf(kpis.visibilityScore, (delta) => formatSignedNumber(delta, locale))}
        hint={vsLastWeek}
        trendLabels={trendLabels}
      />
      <KpiCard
        label={t('shareOfVoice')}
        value={
          kpis.shareOfVoice.value === null ? empty : formatPercent(kpis.shareOfVoice.value, locale)
        }
        // Share of voice is a ratio, so its change is shown in percentage points.
        delta={deltaOf(
          kpis.shareOfVoice,
          (delta) => t('percentagePoints', { value: formatSignedNumber(delta, locale) }),
          { scale: 100 },
        )}
        hint={vsLastWeek}
        trendLabels={trendLabels}
      />
      <KpiCard
        label={t('avgPosition')}
        value={
          kpis.avgPosition.value === null ? empty : formatNumber(kpis.avgPosition.value, locale)
        }
        delta={deltaOf(kpis.avgPosition, (delta) => formatSignedNumber(delta, locale), {
          lowerIsBetter: true,
        })}
        hint={vsLastWeek}
        trendLabels={trendLabels}
      />
      <KpiCard
        label={t('positiveSentiment')}
        value={
          kpis.positiveSentiment.value === null
            ? empty
            : formatPercent(kpis.positiveSentiment.value, locale)
        }
        delta={deltaOf(kpis.positiveSentiment, (delta) => formatSignedNumber(delta, locale), {
          scale: 100,
        })}
        hint={t('ofMentions')}
        trendLabels={trendLabels}
      />
    </div>
  );
}

/** Same grid, card padding and line heights as KpiCards, so nothing shifts. */
export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <Card key={index} className="flex flex-col gap-1">
          <Skeleton className="my-0.5 h-4 w-28" />
          <Skeleton className="my-0.5 h-8 w-20" />
          <Skeleton className="my-0.5 h-4 w-36" />
        </Card>
      ))}
    </div>
  );
}
