import type { EngineId } from '@/shared/config/domain';

/** Product names are proper nouns, so they are the same in every locale. */
export const ENGINE_LABELS: Record<EngineId, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  gemini: 'Gemini',
  claude: 'Claude',
  'ai-overviews': 'AI Overviews',
};
