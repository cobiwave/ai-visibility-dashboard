import type { Sentiment } from '@/shared/config/domain';

/** Shared by the prompts table and the answer cards (features can't import each other). */
export const SENTIMENT_TEXT_COLOR: Record<Sentiment, string> = {
  positive: 'text-success',
  neutral: 'text-warning',
  negative: 'text-danger',
};
