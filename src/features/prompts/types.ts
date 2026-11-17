import type { EngineId, Sentiment, Topic } from '@/shared/config/domain';
import type { Locale } from '@/shared/config/locale';

export interface Prompt {
  id: string; // 'p_001'
  text: Record<Locale, string>;
  topic: Topic;
  tracked: boolean;
  createdAt: string; // ISO
}

export type ScanStatus = 'queued' | 'running' | 'done' | 'failed';

export interface Scan {
  id: string;
  status: ScanStatus;
  progress: number; // 0–1
  startedAt: string; // ISO
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PromptFilters {
  engine?: EngineId;
  topic?: Topic;
  mentioned?: boolean;
  page: number;
}

/** A prompt plus the aggregates the table shows. */
export interface PromptRow extends Prompt {
  /** Engines that mention the brand (x in "x/5"). */
  mentions: number;
  /** Engines counted (5, or 1 when filtering by engine). */
  engineCount: number;
  avgPosition: number | null;
  dominantSentiment: Sentiment | null;
}
