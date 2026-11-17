import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { REVALIDATE_SECRET_HEADER, validateRevalidateRequest } from '@/server/revalidate-request';

/**
 * Simulates the "scan pipeline finished" webhook. `revalidateTag(tag, 'max')`
 * marks tagged entries stale: the next visitor gets the stale page while it
 * regenerates in the background, and the visitor after that sees fresh data.
 */
export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const result = validateRevalidateRequest({
    secret: request.headers.get(REVALIDATE_SECRET_HEADER),
    expectedSecret: process.env.REVALIDATE_SECRET,
    body,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  for (const tag of result.tags) {
    revalidateTag(tag, 'max');
  }

  return NextResponse.json({ revalidated: true, tags: result.tags, now: new Date().toISOString() });
}
