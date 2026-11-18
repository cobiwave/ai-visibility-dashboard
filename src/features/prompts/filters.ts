import { z } from 'zod/mini';
import type { PromptFilters } from '@/features/prompts/types';
import { ENGINE_IDS, TOPICS } from '@/shared/config/domain';

// One schema for every place that reads filters from a URL: the page (server),
// GET /api/prompts and the client hooks. Each field is wrapped in its own
// `z.catch`, so an invalid value falls back to its default instead of failing
// the whole parse: `?topic=nope&page=2` still gives page 2.
// `zod/mini` (functions instead of chained methods) because this file ships
// to the browser: it tree-shakes, full `zod` doesn't.
const promptFiltersSchema = z.object({
  engine: z.catch(z.optional(z.enum(ENGINE_IDS)), undefined),
  topic: z.catch(z.optional(z.enum(TOPICS)), undefined),
  mentioned: z.catch(
    z.optional(
      z.pipe(
        z.enum(['true', 'false']),
        z.transform((value) => value === 'true'),
      ),
    ),
    undefined,
  ),
  // Missing → Number(undefined) is NaN → fails int() → falls back to 1.
  page: z.catch(z.pipe(z.coerce.number(), z.int().check(z.minimum(1), z.maximum(1000))), 1),
});

/** What Next passes as `searchParams`, or URLSearchParams on the client / in Route Handlers. */
export type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

function read(input: SearchParamsInput, key: keyof PromptFilters): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
  const value = input[key];
  // `?topic=a&topic=b` arrives as an array; the first value wins.
  return Array.isArray(value) ? value[0] : value;
}

export function parsePromptFilters(input: SearchParamsInput): PromptFilters {
  const { engine, topic, mentioned, page } = promptFiltersSchema.parse({
    engine: read(input, 'engine'),
    topic: read(input, 'topic'),
    mentioned: read(input, 'mentioned'),
    page: read(input, 'page'),
  });

  // Only defined keys, so the same filters always produce the same object.
  return {
    ...(engine && { engine }),
    ...(topic && { topic }),
    ...(mentioned !== undefined && { mentioned }),
    page,
  };
}

/** The inverse: defaults are left out so URLs stay short (`page=1` is implied). */
export function filtersToSearchParams(filters: PromptFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.engine) params.set('engine', filters.engine);
  if (filters.topic) params.set('topic', filters.topic);
  if (filters.mentioned !== undefined) params.set('mentioned', String(filters.mentioned));
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}
