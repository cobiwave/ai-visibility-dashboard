'use client';

import { useLocale, useTranslations } from 'next-intl';
import { pageItems } from '@/features/prompts/pagination';
import { cn } from '@/shared/lib/cn';
import { formatNumber } from '@/shared/lib/format';

const BUTTON = 'flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm tabular-nums';

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations('Prompts.pagination');
  const locale = useLocale();
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label={t('label')} className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-text-muted text-sm tabular-nums">
        {t('summary', {
          from: formatNumber(from, locale),
          to: formatNumber(to, locale),
          total: formatNumber(total, locale),
        })}
      </p>
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            aria-label={t('previous')}
            className={cn(BUTTON, 'hover:bg-surface-3 disabled:opacity-40')}
            disabled={page <= 1}
            onClick={() => {
              onPageChange(page - 1);
            }}
          >
            <span aria-hidden>‹</span>
          </button>
        </li>
        {pageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${String(index)}`} aria-hidden className={cn(BUTTON, 'text-text-muted')}>
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={t('page', { page: item })}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  BUTTON,
                  item === page
                    ? 'bg-accent text-accent-contrast font-semibold'
                    : 'hover:bg-surface-3',
                )}
                onClick={() => {
                  onPageChange(item);
                }}
              >
                {formatNumber(item, locale)}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-label={t('next')}
            className={cn(BUTTON, 'hover:bg-surface-3 disabled:opacity-40')}
            disabled={page >= totalPages}
            onClick={() => {
              onPageChange(page + 1);
            }}
          >
            <span aria-hidden>›</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
