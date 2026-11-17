import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '@/shared/ui/LocaleSwitcher';
import { NavLink } from '@/shared/ui/NavLink';

// Static shell shared by every dashboard page: no data, no runtime APIs.
export default async function DashboardLayout({ children }: LayoutProps<'/[locale]/dashboard'>) {
  const t = await getTranslations('Dashboard');

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="border-border bg-surface-1 flex flex-col gap-4 border-b p-4 md:w-56 md:border-r md:border-b-0">
        <p className="px-3 text-lg font-semibold">{t('appName')}</p>
        <nav aria-label={t('nav.label')}>
          <ul className="flex gap-1 md:flex-col">
            <li>
              <NavLink href="/dashboard">{t('nav.overview')}</NavLink>
            </li>
            <li>
              <NavLink href="/dashboard/prompts" match="prefix">
                {t('nav.prompts')}
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border flex justify-end border-b px-6 py-3">
          <LocaleSwitcher />
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
