import { getLocale, getTranslations } from 'next-intl/server';
import type { PromptSummary } from '@/features/answers/types';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/lib/cn';

/**
 * The ★ is shown, not toggled: toggling lives in the prompts table. A second
 * toggle here would make this feature ship a mutation and a client leaf for a
 * demo that already exists one click away.
 */
export async function PromptHeader({ prompt }: { prompt: PromptSummary }) {
  const t = await getTranslations('PromptDetail');
  const tTopics = await getTranslations('Topics');
  const locale = await getLocale();

  return (
    <header className="flex flex-col gap-3">
      <Link
        href="/dashboard/prompts"
        className="text-text-muted hover:text-text-primary w-fit rounded-sm text-sm"
      >
        <span aria-hidden>← </span>
        {t('back')}
      </Link>
      <h1 className="text-3xl font-semibold">{prompt.text[locale]}</h1>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="border-border bg-surface-2 rounded-sm border px-2">
          {tTopics(prompt.topic)}
        </span>
        <span className={cn(prompt.tracked ? 'text-warning' : 'text-text-muted')}>
          <span aria-hidden>{prompt.tracked ? '★ ' : '☆ '}</span>
          {prompt.tracked ? t('tracked') : t('notTracked')}
        </span>
      </div>
    </header>
  );
}
