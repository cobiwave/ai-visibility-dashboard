import en from '@/messages/en.json';
import es from '@/messages/es.json';
import type { Locale } from '@/shared/config/locale';

export type Messages = typeof en;

// Static imports: both catalogs are tiny, and `satisfies` makes TypeScript
// reject an es.json that is missing a key from en.json.
export const messages = { en, es } satisfies Record<Locale, Messages>;
