import 'server-only';

import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { ALLOWED_TAG_PREFIXES } from '@/shared/config/cache-tags';

export const REVALIDATE_SECRET_HEADER = 'x-revalidate-secret';

const bodySchema = z.object({
  // Next ignores tags over 256 characters, so reject them up front.
  tags: z.array(z.string().min(1).max(256)).min(1).max(20),
});

export type RevalidateError =
  'not_configured' | 'unauthorized' | 'invalid_body' | 'tag_not_allowed';

export type RevalidateValidation =
  { ok: true; tags: string[] } | { ok: false; status: 400 | 401 | 500; error: RevalidateError };

/**
 * Constant-time comparison. Hashing first gives both sides the same length
 * (timingSafeEqual throws on different lengths) and hides the secret's length.
 */
export function secretsMatch(provided: string, expected: string): boolean {
  const providedHash = createHash('sha256').update(provided).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

function isAllowedTag(tag: string): boolean {
  return ALLOWED_TAG_PREFIXES.some(
    (prefix) => tag.startsWith(prefix) && tag.length > prefix.length,
  );
}

/**
 * Pure: no request, no env, no side effects, so every branch is unit-tested.
 * The secret is checked before the body so an unauthenticated caller learns
 * nothing about what a valid body looks like.
 */
export function validateRevalidateRequest(input: {
  secret: string | null;
  expectedSecret: string | undefined;
  body: unknown;
}): RevalidateValidation {
  if (!input.expectedSecret) {
    return { ok: false, status: 500, error: 'not_configured' };
  }

  if (input.secret === null || !secretsMatch(input.secret, input.expectedSecret)) {
    return { ok: false, status: 401, error: 'unauthorized' };
  }

  const parsed = bodySchema.safeParse(input.body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: 'invalid_body' };
  }

  if (!parsed.data.tags.every(isAllowedTag)) {
    return { ok: false, status: 400, error: 'tag_not_allowed' };
  }

  return { ok: true, tags: parsed.data.tags };
}
