import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { locale as rootLocale } from 'next/root-params';
import { messages } from '@/i18n/messages';
import { routing } from '@/i18n/routing';

// The locale comes from the `[locale]` root segment via `next/root-params`,
// not from request headers, so pages stay statically renderable. This
// replaces the deprecated `requestLocale` + `setRequestLocale` pair.
export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const requested = explicitLocale ?? (await rootLocale());
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return { locale, messages: messages[locale] };
});
