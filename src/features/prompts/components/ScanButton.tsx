'use client';

import { useLocale, useTranslations } from 'next-intl';
import { isScanActive, useScanStatus, useStartScan } from '@/features/prompts/queries/use-scan';
import { cn } from '@/shared/lib/cn';
import { formatPercent } from '@/shared/lib/format';

export function ScanButton() {
  const t = useTranslations('Prompts.scan');
  const locale = useLocale();
  const { scanId, start, isStarting, startFailed } = useStartScan();
  const { data: scan } = useScanStatus(scanId);
  const busy = isStarting || isScanActive(scan);

  function statusText(): string | null {
    if (startFailed) return t('startFailed');
    if (isStarting) return t('starting');
    if (!scan) return null;
    if (scan.status === 'queued') return t('queued');
    if (scan.status === 'running') {
      return t('running', {
        progress: formatPercent(Math.floor(scan.progress * 100) / 100, locale),
      });
    }
    return scan.status === 'done' ? t('done') : t('failed');
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Fixed width so the status text changing never moves the button. */}
      <div className="flex w-64 flex-col gap-1">
        <p role="status" className="text-text-muted h-5 text-right text-sm tabular-nums">
          {statusText()}
        </p>
        {scan && isScanActive(scan) ? (
          <div
            role="progressbar"
            aria-label={t('progressLabel')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(scan.progress * 100)}
            className="bg-surface-3 h-1 overflow-hidden rounded-full"
          >
            <div
              className="bg-accent motion-safe:duration-slow h-full motion-safe:transition-all"
              // Data-driven width: an inline style, like the overview bars.
              style={{ width: `${String(scan.progress * 100)}%` }}
            />
          </div>
        ) : (
          <div className="h-1" />
        )}
      </div>
      {/* aria-disabled instead of disabled: a disabled button drops keyboard
          focus mid-scan, aria-disabled keeps it and the click is ignored. */}
      <button
        type="button"
        aria-disabled={busy}
        className={cn(
          'bg-accent text-accent-contrast h-9 rounded-md px-4 text-sm font-semibold',
          busy && 'cursor-not-allowed opacity-60',
        )}
        onClick={() => {
          if (!busy) start();
        }}
      >
        <span aria-hidden>▶ </span>
        {t('run')}
      </button>
    </div>
  );
}
