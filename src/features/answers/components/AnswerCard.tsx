import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ExcerptToggle } from '@/features/answers/components/ExcerptToggle';
import type { Answer, Citation } from '@/features/answers/types';
import { ENGINE_LABELS } from '@/shared/config/engines';
import { cn } from '@/shared/lib/cn';
import { formatDate, formatNumber } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { SENTIMENT_TEXT_COLOR } from '@/shared/ui/sentiment-color';

const ENGINE_MARK_SIZE = 32;

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-text-muted text-xs">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

async function CitationLink({ citation }: { citation: Citation }) {
  const t = await getTranslations('PromptDetail.answer');

  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block rounded-sm border px-2 py-1 text-xs hover:underline',
        citation.isOwnDomain
          ? 'border-accent bg-surface-2 text-accent font-semibold'
          : 'border-border text-text-muted',
      )}
    >
      {citation.domain}
      {citation.isOwnDomain ? ` · ${t('ownDomain')}` : null}
    </a>
  );
}

/**
 * A Server Component: everything here is static per prompt, so it ships no
 * JS. Only <ExcerptToggle> is a client leaf, and it receives the excerpt as
 * already-rendered children.
 */
export async function AnswerCard({ answer }: { answer: Answer }) {
  const t = await getTranslations('PromptDetail.answer');
  const tSentiments = await getTranslations('Sentiments');
  const locale = await getLocale();
  const headingId = `answer-${answer.engine}-heading`;

  return (
    <Card aria-labelledby={headingId} className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        {/* Decorative: the engine name is the heading right next to it. SVGs
            skip the optimizer; explicit width/height reserve the space (no CLS). */}
        <Image
          src={`/engines/${answer.engine}.svg`}
          alt=""
          width={ENGINE_MARK_SIZE}
          height={ENGINE_MARK_SIZE}
        />
        <h2 id={headingId} className="text-lg font-semibold">
          {ENGINE_LABELS[answer.engine]}
        </h2>
        <time dateTime={answer.capturedAt} className="text-text-muted ml-auto text-xs">
          {formatDate(answer.capturedAt, locale)}
        </time>
      </header>

      <dl className="grid grid-cols-3 gap-2">
        <Stat label={t('mentioned')}>
          <span className={answer.mentioned ? 'text-success' : 'text-text-muted'}>
            {answer.mentioned ? t('yes') : t('no')}
          </span>
        </Stat>
        <Stat label={t('position')}>
          {answer.position === null
            ? t('none')
            : t('positionValue', { position: formatNumber(answer.position, locale) })}
        </Stat>
        <Stat label={t('sentiment')}>
          {answer.sentiment ? (
            <span
              className={cn(
                'bg-surface-2 inline-flex items-center gap-1 rounded-sm px-2 text-xs',
                SENTIMENT_TEXT_COLOR[answer.sentiment],
              )}
            >
              <span aria-hidden className="size-2 rounded-full bg-current" />
              {tSentiments(answer.sentiment)}
            </span>
          ) : (
            t('none')
          )}
        </Stat>
      </dl>

      <ExcerptToggle>
        <p className="text-text-primary">{answer.excerpt}</p>
      </ExcerptToggle>

      <div className="flex flex-col gap-2">
        <h3 className="text-text-muted text-xs">{t('citations')}</h3>
        <ul className="flex flex-wrap gap-2">
          {answer.citations.map((citation) => (
            <li key={citation.url}>
              <CitationLink citation={citation} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
