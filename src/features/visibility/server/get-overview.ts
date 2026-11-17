import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import type {
  Brand,
  DailyMetric,
  EngineBreakdown,
  EngineSeries,
  Kpi,
  Overview,
} from '@/features/visibility/types';
import { getAnswers, getBrand, getMetrics, sleep } from '@/server/db';
import { cacheTags } from '@/shared/config/cache-tags';
import { ENGINE_IDS, type Sentiment } from '@/shared/config/domain';

const DELTA_DAYS = 7;

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function kpi(
  latest: DailyMetric[],
  previous: DailyMetric[],
  read: (metric: DailyMetric) => number | null,
): Kpi {
  const isNumber = (value: number | null): value is number => value !== null;
  const value = mean(latest.map(read).filter(isNumber));
  const before = mean(previous.map(read).filter(isNumber));

  return { value, delta: value !== null && before !== null ? value - before : null };
}

/** Pure: turns raw metrics and answer sentiments into the overview view-model. */
export function buildOverview(
  brand: Brand,
  metrics: DailyMetric[],
  sentiments: (Sentiment | null)[],
  generatedAt: string,
): Overview {
  const dates = [...new Set(metrics.map((metric) => metric.date))].sort();
  const latestDate = dates.at(-1);
  const previousDate = dates.at(-1 - DELTA_DAYS);
  const latest = metrics.filter((metric) => metric.date === latestDate);
  const previous = metrics.filter((metric) => metric.date === previousDate);

  const mentioned = sentiments.filter((sentiment) => sentiment !== null);
  const positiveShare =
    mentioned.length === 0
      ? null
      : mentioned.filter((sentiment) => sentiment === 'positive').length / mentioned.length;

  const series: EngineSeries[] = ENGINE_IDS.map((engine) => ({
    engine,
    points: metrics
      .filter((metric) => metric.engine === engine)
      .map(({ date, visibilityScore }) => ({ date, visibilityScore })),
  }));

  const engines: EngineBreakdown[] = latest.map(
    ({ engine, visibilityScore, shareOfVoice, avgPosition }) => ({
      engine,
      visibilityScore,
      shareOfVoice,
      avgPosition,
    }),
  );

  return {
    brand,
    kpis: {
      visibilityScore: kpi(latest, previous, (metric) => metric.visibilityScore),
      shareOfVoice: kpi(latest, previous, (metric) => metric.shareOfVoice),
      avgPosition: kpi(latest, previous, (metric) => metric.avgPosition),
      positiveSentiment: { value: positiveShare, delta: null },
    },
    series,
    engines,
    generatedAt,
  };
}

/**
 * ISR in Cache Components terms: the result is cached per `brandId` (it is an
 * argument, so it's part of the cache key), served stale after an hour while it
 * regenerates in the background, and can be invalidated on demand by tag from
 * the revalidate webhook. Nothing here reads the request or translations, so
 * the entry is the same for every locale and visitor.
 */
export async function getOverview(brandId: string): Promise<Overview> {
  'use cache';
  cacheLife('hours');
  cacheTag(cacheTags.metrics(brandId));

  await sleep();
  // The mock store only holds one brand; a real query would filter by brandId.
  return buildOverview(
    getBrand(),
    getMetrics(),
    getAnswers().map((answer) => answer.sentiment),
    new Date().toISOString(),
  );
}
