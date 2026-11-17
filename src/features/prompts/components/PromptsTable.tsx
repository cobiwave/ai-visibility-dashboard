'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { Pagination } from '@/features/prompts/components/Pagination';
import { PromptsTableHead } from '@/features/prompts/components/PromptsTableHead';
import { PROMPTS_ROW_CLASS, PROMPTS_TABLE_CLASS } from '@/features/prompts/components/table-styles';
import { TrackToggle } from '@/features/prompts/components/TrackToggle';
import { usePromptFilters } from '@/features/prompts/queries/use-prompt-filters';
import { usePrompts } from '@/features/prompts/queries/use-prompts';
import { useToggleTracked } from '@/features/prompts/queries/use-toggle-tracked';
import type { PromptRow } from '@/features/prompts/types';
import { Link } from '@/i18n/navigation';
import type { Sentiment } from '@/shared/config/domain';
import { cn } from '@/shared/lib/cn';
import { formatNumber } from '@/shared/lib/format';
import { Toast, type ToastMessage } from '@/shared/ui/Toast';

const SENTIMENT_COLOR: Record<Sentiment, string> = {
  positive: 'text-success',
  neutral: 'text-warning',
  negative: 'text-danger',
};

export function PromptsTable() {
  const t = useTranslations('Prompts');
  const tTopics = useTranslations('Topics');
  const tSentiments = useTranslations('Sentiments');
  const locale = useLocale();
  const { filters, setFilters } = usePromptFilters();
  const { data, isPlaceholderData, isError } = usePrompts(filters);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const toggle = useToggleTracked({
    onFailure: (promptId) => {
      const row = data?.items.find((item) => item.id === promptId);
      setToast({
        id: Date.now(),
        text: t('toast.toggleFailed', { prompt: row?.text[locale] ?? promptId }),
      });
    },
  });

  if (!data) {
    // Only reachable if the prefetch failed; hydrated data is there otherwise.
    return <p className="text-danger text-sm">{isError ? t('table.loadFailed') : null}</p>;
  }

  function renderRow(row: PromptRow) {
    const text = row.text[locale];

    return (
      <tr key={row.id} className={PROMPTS_ROW_CLASS}>
        <td className="px-2">
          <TrackToggle
            tracked={row.tracked}
            label={t('table.trackLabel', { prompt: text })}
            onToggle={() => {
              toggle.mutate({ promptId: row.id, tracked: !row.tracked });
            }}
          />
        </td>
        <td className="truncate px-2">
          <Link
            href={`/dashboard/prompts/${row.id}`}
            className="hover:text-accent rounded-sm underline-offset-4 hover:underline"
          >
            {text}
          </Link>
        </td>
        <td className="text-text-muted px-2">{tTopics(row.topic)}</td>
        <td className="px-2 tabular-nums">
          {t('table.mentionsValue', {
            count: formatNumber(row.mentions, locale),
            total: formatNumber(row.engineCount, locale),
          })}
        </td>
        <td className="px-2 tabular-nums">
          {row.avgPosition === null ? t('table.none') : formatNumber(row.avgPosition, locale)}
        </td>
        <td className="px-2">
          {row.dominantSentiment ? (
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  'size-2 rounded-full bg-current',
                  SENTIMENT_COLOR[row.dominantSentiment],
                )}
              />
              {tSentiments(row.dominantSentiment)}
            </span>
          ) : (
            t('table.none')
          )}
        </td>
      </tr>
    );
  }

  return (
    <>
      <div className="border-border bg-surface-1 overflow-x-auto rounded-lg border">
        <table
          aria-busy={isPlaceholderData}
          className={cn(
            PROMPTS_TABLE_CLASS,
            // Old rows stay visible (keepPreviousData) but dim while the next page loads.
            isPlaceholderData && 'opacity-60',
            'motion-safe:duration-base motion-safe:transition-opacity',
          )}
        >
          <caption className="sr-only">{t('table.caption')}</caption>
          <PromptsTableHead />
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-text-muted h-24 px-2 text-center">
                  {t('table.empty')}
                </td>
              </tr>
            ) : (
              data.items.map(renderRow)
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        onPageChange={(page) => {
          setFilters({ ...filters, page });
        }}
      />
      <Toast toast={toast} onDismiss={dismissToast} dismissLabel={t('toast.dismiss')} />
    </>
  );
}
