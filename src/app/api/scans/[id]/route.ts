import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getScan, SCAN_ID_PATTERN } from '@/features/prompts/server/get-scan';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const paramsSchema = z.object({ id: z.string().regex(SCAN_ID_PATTERN) });

/** Stateless: the scan's state is derived from its id, so any instance can answer. */
export async function GET(_request: Request, { params }: RouteContext<'/api/scans/[id]'>) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400, headers: NO_STORE });
  }

  const scan = await getScan(parsed.data.id);
  if (!scan) {
    return NextResponse.json({ error: 'not_found' }, { status: 404, headers: NO_STORE });
  }

  return NextResponse.json(scan, { headers: NO_STORE });
}
