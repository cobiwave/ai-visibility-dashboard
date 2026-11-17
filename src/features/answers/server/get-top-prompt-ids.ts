import 'server-only';

import { topPromptIdsByMentions } from '@/features/answers/top-prompts';
import { getAnswers } from '@/server/db';

/** Called by generateStaticParams at build time: the pages worth prerendering. */
export function getTopPromptIds(limit: number): string[] {
  return topPromptIdsByMentions(getAnswers(), limit);
}
