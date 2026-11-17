import type { EngineId, Sentiment, Topic } from '@/shared/config/domain';
import type { Locale } from '@/shared/config/locale';

export interface Citation {
  url: string;
  domain: string;
  isOwnDomain: boolean;
}

export interface Answer {
  promptId: string;
  engine: EngineId;
  mentioned: boolean;
  position: number | null; // rank among brands mentioned, null if absent
  sentiment: Sentiment | null;
  excerpt: string; // ~600 chars
  citations: Citation[];
  capturedAt: string; // ISO
}

/**
 * The detail page only needs these prompt fields. Declared here (not imported
 * from the prompts feature) so features stay independent; TypeScript's
 * structural typing accepts a full Prompt wherever this is expected.
 */
export interface PromptSummary {
  id: string;
  text: Record<Locale, string>;
  topic: Topic;
  tracked: boolean;
}

export interface PromptWithAnswers {
  prompt: PromptSummary;
  answers: Answer[];
}
