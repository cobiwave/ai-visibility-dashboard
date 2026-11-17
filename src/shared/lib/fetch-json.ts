import type { z } from 'zod';

/**
 * GET + validate. The client doesn't trust the network: the schema checks the
 * response shape at runtime, which also gives a typed result without a cast.
 */
export async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`GET ${url} failed with ${String(response.status)}`);
  return schema.parse(await response.json());
}
