import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '@/shared/ui/LocaleSwitcher';

// Placeholder: the real overview is built in session B.
export default async function DashboardPage() {
  const t = await getTranslations('Dashboard');

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <LocaleSwitcher />
      </header>
      <p className="text-text-muted">{t('placeholder')}</p>
    </main>
  );
}
