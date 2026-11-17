import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Next 16 renamed middleware to proxy. Adds the locale prefix (`/` → `/en`)
// and negotiates the locale from the cookie / Accept-Language header.
export const proxy = createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and files with an extension.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
