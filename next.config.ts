import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Finds ./src/i18n/request.ts and wires it into the build.
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default withNextIntl(nextConfig);
