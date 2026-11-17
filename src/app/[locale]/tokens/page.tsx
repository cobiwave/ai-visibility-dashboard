import { getTranslations } from 'next-intl/server';

const colorTokens = [
  { name: 'surface-0', className: 'bg-surface-0' },
  { name: 'surface-1', className: 'bg-surface-1' },
  { name: 'surface-2', className: 'bg-surface-2' },
  { name: 'surface-3', className: 'bg-surface-3' },
  { name: 'border', className: 'bg-border' },
  { name: 'text-primary', className: 'bg-text-primary' },
  { name: 'text-muted', className: 'bg-text-muted' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'accent-contrast', className: 'bg-accent-contrast' },
  { name: 'success', className: 'bg-success' },
  { name: 'warning', className: 'bg-warning' },
  { name: 'danger', className: 'bg-danger' },
  { name: 'engine-chatgpt', className: 'bg-engine-chatgpt' },
  { name: 'engine-perplexity', className: 'bg-engine-perplexity' },
  { name: 'engine-gemini', className: 'bg-engine-gemini' },
  { name: 'engine-claude', className: 'bg-engine-claude' },
  { name: 'engine-ai-overviews', className: 'bg-engine-ai-overviews' },
] as const;

const typeTokens = [
  { name: 'xs', className: 'text-xs' },
  { name: 'sm', className: 'text-sm' },
  { name: 'base', className: 'text-base' },
  { name: 'lg', className: 'text-lg' },
  { name: 'xl', className: 'text-xl' },
  { name: '2xl', className: 'text-2xl' },
  { name: '3xl', className: 'text-3xl' },
] as const;

const spacingTokens = [
  { name: '1 · 4px', className: 'p-1' },
  { name: '2 · 8px', className: 'p-2' },
  { name: '3 · 12px', className: 'p-3' },
  { name: '4 · 16px', className: 'p-4' },
  { name: '6 · 24px', className: 'p-6' },
  { name: '8 · 32px', className: 'p-8' },
  { name: '10 · 40px', className: 'p-10' },
] as const;

const motionTokens = [
  { name: 'duration-fast · 150ms', className: 'motion-safe:duration-fast' },
  { name: 'duration-base · 250ms', className: 'motion-safe:duration-base' },
  { name: 'duration-slow · 400ms', className: 'motion-safe:duration-slow' },
] as const;

export default async function TokensPage() {
  const t = await getTranslations('Tokens');

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-accent text-sm font-medium">{t('eyebrow')}</p>
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <p className="text-text-muted">{t('intro')}</p>
      </header>

      <section aria-labelledby="colors-heading" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold" id="colors-heading">
          {t('colors')}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {colorTokens.map((token) => (
            <div
              className="border-border bg-surface-1 flex min-h-24 flex-col justify-between rounded-md border p-3"
              key={token.name}
            >
              <span className="text-text-muted text-sm">{token.name}</span>
              <span aria-hidden="true" className={`h-8 rounded-sm ${token.className}`} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="type-heading" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold" id="type-heading">
          {t('typography')}
        </h2>
        <div className="border-border bg-surface-1 flex flex-col gap-3 rounded-lg border p-5">
          {typeTokens.map((token) => (
            <p className={token.className} key={token.name}>
              {token.name} — {t('sample')}
            </p>
          ))}
          <p className="text-text-muted font-mono text-sm">Geist Mono · 0123456789</p>
        </div>
      </section>

      <section aria-labelledby="spacing-heading" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold" id="spacing-heading">
          {t('spacing')}
        </h2>
        <div className="border-border bg-surface-1 flex flex-wrap items-start gap-3 rounded-lg border p-5">
          {spacingTokens.map((token) => (
            <div
              className={`bg-accent text-accent-contrast rounded-sm text-xs font-medium ${token.className}`}
              key={token.name}
            >
              {token.name}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="shape-heading" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold" id="shape-heading">
          {t('shape')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border-border bg-surface-1 rounded-sm border p-4">{t('radius')} · sm</div>
          <div className="border-border bg-surface-1 rounded-md border p-4">{t('radius')} · md</div>
          <div className="border-border bg-surface-1 rounded-lg border p-4">{t('radius')} · lg</div>
          <div className="bg-surface-1 shadow-card rounded-md p-4">{t('shadow')} · card</div>
          <div className="bg-surface-1 shadow-popover rounded-md p-4">{t('shadow')} · popover</div>
        </div>
      </section>

      <section aria-labelledby="motion-heading" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold" id="motion-heading">
          {t('motion')}
        </h2>
        <p className="text-text-muted text-sm">{t('motionHint')}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {motionTokens.map((token) => (
            <div
              className={`border-border bg-surface-1 motion-safe:ease-out-quart rounded-md border p-4 motion-safe:transition-transform motion-safe:hover:translate-x-4 ${token.className}`}
              key={token.name}
            >
              {token.name}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
