import type { EngineId } from '@/shared/config/domain';

/**
 * Full class names (not built with string templates) so Tailwind can find
 * them when it scans the source. Charts use `currentColor` for strokes and
 * `bg-current` for fills, so one text color class per engine is enough.
 */
export const ENGINE_TEXT_COLOR: Record<EngineId, string> = {
  chatgpt: 'text-engine-chatgpt',
  perplexity: 'text-engine-perplexity',
  gemini: 'text-engine-gemini',
  claude: 'text-engine-claude',
  'ai-overviews': 'text-engine-ai-overviews',
};
