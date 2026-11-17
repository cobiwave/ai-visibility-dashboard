import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// Rendered by notFound() inside the [locale] layout, so the locale comes from
// the root param and the page is translated like any other.
export default async function PromptNotFound() {
  const t = await getTranslations('PromptDetail.notFound');

  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <p className="text-text-muted">{t('body')}</p>
      <Link href="/dashboard/prompts" className="text-accent rounded-sm text-sm hover:underline">
        {t('back')}
      </Link>
    </div>
  );
}
