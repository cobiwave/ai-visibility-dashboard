'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { filtersToSearchParams, parsePromptFilters } from '@/features/prompts/filters';
import { usePromptFilters } from '@/features/prompts/queries/use-prompt-filters';
import type { PromptFilters } from '@/features/prompts/types';
import { ENGINE_IDS, TOPICS } from '@/shared/config/domain';
import { ENGINE_LABELS } from '@/shared/config/engines';

const FIELD = 'flex flex-col gap-1 text-sm';
const SELECT = 'border-border bg-surface-1 h-9 min-w-40 rounded-md border px-2';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={FIELD}>
      <span className="text-text-muted">{label}</span>
      {children}
    </label>
  );
}

export function FiltersBar() {
  const t = useTranslations('Prompts.filters');
  const tTopics = useTranslations('Topics');
  const { filters, setFilters } = usePromptFilters();

  // Go through the URL format and back through the same zod schema, so a
  // <select> value never needs a cast. Changing a filter resets to page 1.
  function update(key: keyof Omit<PromptFilters, 'page'>, value: string) {
    const params = filtersToSearchParams(filters);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setFilters(parsePromptFilters(params));
  }

  return (
    <form
      aria-label={t('label')}
      className="flex flex-wrap gap-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Field label={t('engine')}>
        <select
          className={SELECT}
          value={filters.engine ?? ''}
          onChange={(event) => {
            update('engine', event.target.value);
          }}
        >
          <option value="">{t('allEngines')}</option>
          {ENGINE_IDS.map((engine) => (
            <option key={engine} value={engine}>
              {ENGINE_LABELS[engine]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t('topic')}>
        <select
          className={SELECT}
          value={filters.topic ?? ''}
          onChange={(event) => {
            update('topic', event.target.value);
          }}
        >
          <option value="">{t('all')}</option>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {tTopics(topic)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t('mentioned')}>
        <select
          className={SELECT}
          value={filters.mentioned === undefined ? '' : String(filters.mentioned)}
          onChange={(event) => {
            update('mentioned', event.target.value);
          }}
        >
          <option value="">{t('all')}</option>
          <option value="true">{t('yes')}</option>
          <option value="false">{t('no')}</option>
        </select>
      </Field>
    </form>
  );
}
