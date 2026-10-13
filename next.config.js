// `npm run analyze` (or ANALYZE=true) opens the bundle report after the build.
// Using npm_lifecycle_event keeps the script cross-platform (no `cross-env` needed on Windows).
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true' || process.env.npm_lifecycle_event === 'analyze',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Lint runs as a dedicated step (`npm run lint`) locally and in CI
    ignoreDuringBuilds: true,
  },
  // Keeps <html lang="fr">
  i18n: {
    locales: ['fr'],
    defaultLocale: 'fr',
  },
}

module.exports = withBundleAnalyzer(nextConfig)
