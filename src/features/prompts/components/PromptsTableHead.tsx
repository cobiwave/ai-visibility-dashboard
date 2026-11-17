import { useTranslations } from 'next-intl';

/**
 * No 'use client': rendered by the client table and by the server skeleton,
 * so both get identical column widths. next-intl's useTranslations works in
 * either environment.
 */
export function PromptsTableHead() {
  const t = useTranslations('Prompts.table');

  return (
    <thead className="text-text-muted">
      <tr className="border-border h-10 border-b">
        <th scope="col" className="w-12 px-2 font-medium">
          <span className="sr-only">{t('track')}</span>
        </th>
        <th scope="col" className="px-2 font-medium">
          {t('prompt')}
        </th>
        <th scope="col" className="w-32 px-2 font-medium">
          {t('topic')}
        </th>
        <th scope="col" className="w-28 px-2 font-medium">
          {t('mentions')}
        </th>
        <th scope="col" className="w-24 px-2 font-medium">
          {t('position')}
        </th>
        <th scope="col" className="w-32 px-2 font-medium">
          {t('sentiment')}
        </th>
      </tr>
    </thead>
  );
}
