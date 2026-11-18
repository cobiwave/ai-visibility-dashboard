import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { AnswerCard } from '@/features/answers/components/AnswerCard';
import { PromptHeader } from '@/features/answers/components/PromptHeader';
import { getPromptWithAnswers } from '@/features/answers/server/get-prompt-with-answers';
import { getTopPromptIds } from '@/features/answers/server/get-top-prompt-ids';

const PRERENDERED_PROMPTS = 20;

// SSG for the 20 most-mentioned prompts. Combined with the locale segment's
// own generateStaticParams, that's 20 × 2 = 40 pages at build time. Any other
// id renders on its first request and is then cached (ISR).
export function generateStaticParams() {
  return getTopPromptIds(PRERENDERED_PROMPTS).map((promptId) => ({ promptId }));
}

// No <Suspense> around the data: it is cached, so a prerendered page is fully
// static, and the existence check runs before anything inside the page
// renders. See the README for why an on-demand unknown id still answers 200.
export default async function PromptDetailPage({
  params,
}: PageProps<'/[locale]/dashboard/prompts/[promptId]'>) {
  const { promptId } = await params;
  const data = await getPromptWithAnswers(promptId);
  if (!data) notFound();

  const t = await getTranslations('PromptDetail');

  return (
    <>
      <PromptHeader prompt={data.prompt} />
      <section aria-label={t('answersLabel')}>
        {/* items-start: expanding one card never stretches its neighbour. */}
        <div className="grid items-start gap-4 md:grid-cols-2">
          {data.answers.map((answer) => (
            <AnswerCard key={answer.engine} answer={answer} />
          ))}
        </div>
      </section>
    </>
  );
}
