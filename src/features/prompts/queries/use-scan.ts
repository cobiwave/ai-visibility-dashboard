'use client';

import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { startScanAction } from '@/features/prompts/actions/start-scan';
import { fetchScan } from '@/features/prompts/queries/api';
import { promptKeys } from '@/features/prompts/queries/keys';
import type { Scan } from '@/features/prompts/types';

const POLL_INTERVAL_MS = 1500;

export function isScanActive(scan: Scan | undefined): boolean {
  return scan?.status === 'queued' || scan?.status === 'running';
}

/**
 * Polls a scan until it finishes. With no scan yet, `skipToken` disables the
 * query (type-safely, unlike `enabled: false` with a maybe-null id).
 */
export function useScanStatus(scanId: string | null) {
  const client = useQueryClient();

  return useQuery({
    queryKey: promptKeys.scan(scanId ?? 'none'),
    queryFn:
      scanId === null
        ? skipToken
        : async () => {
            const scan = await fetchScan(scanId);
            // The poll that first sees `done` is also the last poll (the interval
            // below turns off), so this invalidation runs once, with no effect hook.
            if (scan.status === 'done') {
              await client.invalidateQueries({ queryKey: promptKeys.lists() });
            }
            return scan;
          },
    refetchInterval: (query) => (isScanActive(query.state.data) ? POLL_INTERVAL_MS : false),
  });
}

/** Starts a scan through a Server Action and seeds the cache with its first state. */
export function useStartScan() {
  const client = useQueryClient();
  const [scanId, setScanId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => startScanAction(),
    onSuccess: (scan) => {
      client.setQueryData(promptKeys.scan(scan.id), scan);
      setScanId(scan.id);
    },
  });

  return {
    scanId,
    start: () => {
      mutation.mutate();
    },
    isStarting: mutation.isPending,
    startFailed: mutation.isError,
  };
}
