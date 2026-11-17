import type { EngineId } from '@/shared/config/domain';

export interface Brand {
  id: string;
  name: string;
  domain: string;
  competitors: string[];
}

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  engine: EngineId;
  visibilityScore: number; // 0–100
  shareOfVoice: number; // 0–1
  avgPosition: number | null;
}

export interface Kpi {
  value: number | null;
  /** Change vs 7 days earlier; null when there is nothing to compare against. */
  delta: number | null;
}

export interface OverviewKpis {
  visibilityScore: Kpi;
  shareOfVoice: Kpi;
  avgPosition: Kpi;
  positiveSentiment: Kpi; // 0–1, share of mentions that are positive
}

export interface EngineSeries {
  engine: EngineId;
  points: { date: string; visibilityScore: number }[];
}

export interface EngineBreakdown {
  engine: EngineId;
  visibilityScore: number;
  shareOfVoice: number;
  avgPosition: number | null;
}

export interface Overview {
  brand: Brand;
  kpis: OverviewKpis;
  series: EngineSeries[];
  engines: EngineBreakdown[];
  /** ISO time the cached entry was built. Changes only when the cache regenerates. */
  generatedAt: string;
}
