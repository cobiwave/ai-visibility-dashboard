'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/shared/lib/cn';

function LocaleLinks({ search }: { search: string }) {
  const t = useTranslations('LocaleSwitcher');
  const currentLocale = useLocale();
  const pathname = usePathname();
  const href = search ? `${pathname}?${search}` : pathname;

  return (
    <nav aria-label={t('label')}>
      <ul className="border-border flex rounded-md border p-1">
        {routing.locales.map((locale) => {
          const isCurrent = locale === currentLocale;

          return (
            <li key={locale}>
              <Link
                aria-current={isCurrent ? 'true' : undefined}
                className={cn(
                  'rounded-sm px-2 py-1 text-sm font-medium uppercase',
                  isCurrent
                    ? 'bg-surface-3 text-text-primary'
                    : 'text-text-muted hover:text-text-primary',
                )}
                href={href}
                hrefLang={locale}
                lang={locale}
                locale={locale}
                title={new Intl.DisplayNames([locale], { type: 'language' }).of(locale)}
              >
                {locale}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function LocaleLinksWithQuery() {
  return <LocaleLinks search={useSearchParams().toString()} />;
}

/**
 * Switches locale while keeping the current path and query string.
 * The query is only known at request time, so it is read inside a Suspense
 * boundary; the prerendered fallback keeps the path and drops the query.
 */
export function LocaleSwitcher() {
  return (
    <Suspense fallback={<LocaleLinks search="" />}>
      <LocaleLinksWithQuery />
    </Suspense>
  );
}
