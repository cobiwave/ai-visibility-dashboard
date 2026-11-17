import { z } from 'zod';
import { filtersToSearchParams } from '@/features/prompts/filters';
import type { Paginated, PromptFilters, PromptRow, Scan } from '@/features/prompts/types';
import { SENTIMENTS, TOPICS } from '@/shared/config/domain';
import { fetchJson } from '@/shared/lib/fetch-json';

// Client-side readers for the Route Handlers. The `z.ZodType<…>` annotations
// make TypeScript check that each schema matches the type in types.ts.

const promptRowSchema: z.ZodType<PromptRow> = z.object({
  id: z.string(),
  text: z.object({ en: z.string(), es: z.string() }),
  topic: z.enum(TOPICS),
  tracked: z.boolean(),
  createdAt: z.string(),
  mentions: z.number(),
  engineCount: z.number(),
  avgPosition: z.number().nullable(),
  dominantSentiment: z.enum(SENTIMENTS).nullable(),
});

const promptPageSchema: z.ZodType<Paginated<PromptRow>> = z.object({
  items: z.array(promptRowSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
});

const scanSchema: z.ZodType<Scan> = z.object({
  id: z.string(),
  status: z.enum(['queued', 'running', 'done', 'failed']),
  progress: z.number(),
  startedAt: z.string(),
});

export function fetchPrompts(filters: PromptFilters): Promise<Paginated<PromptRow>> {
  const query = filtersToSearchParams(filters).toString();
  return fetchJson(`/api/prompts${query ? `?${query}` : ''}`, promptPageSchema);
}

export function fetchScan(id: string): Promise<Scan> {
  return fetchJson(`/api/scans/${encodeURIComponent(id)}`, scanSchema);
}
