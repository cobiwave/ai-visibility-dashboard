import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';

// The landing page is cut for the MVP (SPEC §0), so the locale root goes
// straight to the dashboard.
export default async function LocaleIndexPage() {
  redirect({ href: '/dashboard', locale: await getLocale() });
}
