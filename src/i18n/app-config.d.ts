import type { Messages } from '@/i18n/messages';
import type { Locale } from '@/shared/config/locale';

// Types next-intl's `useLocale`, `useTranslations` keys, etc.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
