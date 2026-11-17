import { getLocale, getTranslations } from 'next-intl/server';
import type { EngineSeries } from '@/features/visibility/types';
import { ENGINE_IDS } from '@/shared/config/domain';
import { ENGINE_LABELS } from '@/shared/config/engines';
import type { Locale } from '@/shared/config/locale';
import { cn } from '@/shared/lib/cn';
import { formatDate, formatNumber } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ENGINE_TEXT_COLOR } from '@/shared/ui/engine-color';

// The SVG uses a 0–100 coordinate system in both axes and stretches to its
// box (preserveAspectRatio="none"). Scores are already 0–100, so y maps 1:1.
// `vector-effect: non-scaling-stroke` keeps lines 2px wide when stretched.
const GRID_LINES = [0, 50, 100];

function toPoints(values: number[]): string {
  const lastIndex = Math.max(values.length - 1, 1);
  return values
    .map((value, index) => `${String((index / lastIndex) * 100)},${String(100 - value)}`)
    .join(' ');
}

/** Static: engine names and colors don't depend on data, so the skeleton renders it too. */
function EngineLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {ENGINE_IDS.map((engine) => (
        <li key={engine} className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn('size-2.5 rounded-full bg-current', ENGINE_TEXT_COLOR[engine])}
          />
          {ENGINE_LABELS[engine]}
        </li>
      ))}
    </ul>
  );
}

function YAxis({ locale }: { locale: Locale }) {
  return (
    <div aria-hidden className="text-text-muted flex flex-col justify-between text-xs tabular-nums">
      {GRID_LINES.toReversed().map((value) => (
        <span key={value}>{formatNumber(value, locale)}</span>
      ))}
    </div>
  );
}

export async function TrendChart({ series }: { series: EngineSeries[] }) {
  const t = await getTranslations('Overview.chart');
  const locale = await getLocale();
  const dates = series[0]?.points.map((point) => point.date) ?? [];
  const firstDate = dates.at(0);
  const lastDate = dates.at(-1);
  const start = firstDate ? formatDate(firstDate, locale) : '';
  const end = lastDate ? formatDate(lastDate, locale) : '';

  // A text summary for screen readers, who can't read the lines.
  const latest = series
    .map(({ engine, points }) => {
      const last = points.at(-1);
      return last ? `${ENGINE_LABELS[engine]} ${formatNumber(last.visibilityScore, locale)}` : null;
    })
    .filter((entry) => entry !== null)
    .join(', ');

  return (
    <Card aria-labelledby="trend-chart-heading" className="flex flex-col gap-4">
      <h2 id="trend-chart-heading" className="text-lg font-semibold">
        {t('title')}
      </h2>
      <div className="flex h-56 gap-2">
        <YAxis locale={locale} />
        <svg
          role="img"
          aria-labelledby="trend-chart-title trend-chart-desc"
          className="border-border h-full flex-1 overflow-visible border-b border-l"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <title id="trend-chart-title">{t('title')}</title>
          <desc id="trend-chart-desc">{t('description', { start, end, latest })}</desc>
          {GRID_LINES.map((value) => (
            <line
              key={value}
              x1={0}
              x2={100}
              y1={100 - value}
              y2={100 - value}
              className="stroke-border"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {series.map(({ engine, points }) => (
            <polyline
              key={engine}
              points={toPoints(points.map((point) => point.visibilityScore))}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className={ENGINE_TEXT_COLOR[engine]}
            />
          ))}
        </svg>
      </div>
      <div aria-hidden className="text-text-muted flex justify-between pl-8 text-xs">
        <span>{start}</span>
        <span>{end}</span>
      </div>
      <EngineLegend />
    </Card>
  );
}

export async function TrendChartSkeleton() {
  const t = await getTranslations('Overview.chart');

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <Skeleton className="h-56" />
      <Skeleton className="h-4" />
      <EngineLegend />
    </Card>
  );
}
