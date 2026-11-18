'use client';

import { useTranslations } from 'next-intl';
import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * The only client component in this feature: it owns one boolean. The excerpt
 * itself is server-rendered and arrives as `children`, so its text never
 * becomes client JS.
 *
 * Height animates with the grid-rows trick (see `grid-rows-peek` in
 * globals.css): the outer grid transitions its row, the inner element clips
 * with `overflow: hidden` and `min-height: 0` so the row can shrink below the
 * content's height. Only the card grows, so nothing outside it shifts sideways.
 *
 * The collapsed text stays in the accessibility tree, so screen readers can
 * read the whole answer either way; `aria-expanded` announces the state. The
 * label stays the same and only `aria-expanded` changes, so the state isn't
 * announced twice.
 */
export function ExcerptToggle({ children }: { children: ReactNode }) {
  const t = useTranslations('PromptDetail.answer');
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();

  return (
    <div className="flex flex-col gap-2">
      <div
        id={regionId}
        className={cn(
          'grid text-sm',
          'transition-grid-rows duration-base ease-out-quart motion-reduce:transition-none',
          expanded ? 'grid-rows-open' : 'grid-rows-peek',
        )}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={regionId}
        className="text-accent flex w-fit items-center gap-1 rounded-sm text-sm font-medium hover:underline"
        onClick={() => {
          setExpanded((value) => !value);
        }}
      >
        {t('fullAnswer')}
        <span
          aria-hidden
          className={cn(
            'motion-safe:duration-base motion-safe:ease-out-quart motion-safe:transition-transform',
            expanded && 'rotate-180',
          )}
        >
          ▾
        </span>
      </button>
    </div>
  );
}
