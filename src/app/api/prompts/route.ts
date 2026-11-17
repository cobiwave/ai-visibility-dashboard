import { NextResponse, type NextRequest } from 'next/server';
import { parsePromptFilters } from '@/features/prompts/filters';
import { listPrompts } from '@/features/prompts/server/list-prompts';

// Tenant data: never stored by a shared cache or the browser's HTTP cache.
// React Query is the client cache for this endpoint.
const NO_STORE = { 'Cache-Control': 'private, no-store' };

/** Same zod schema as the page, so the URL means the same thing in both places. */
export async function GET(request: NextRequest) {
  const filters = parsePromptFilters(request.nextUrl.searchParams);
  return NextResponse.json(await listPrompts(filters), { headers: NO_STORE });
}
