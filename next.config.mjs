/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    return [
      // Digital Asset Links for the Play Store TWA.
      { source: '/.well-known/assetlinks.json', destination: '/api/assetlinks' },
    ];
  },
};

import { withSentryConfig } from '@sentry/nextjs';

// Sentry's build plugin. Without SENTRY_AUTH_TOKEN it simply skips source-map
// upload — the SDK still works at runtime once a DSN is set. `silent` keeps the
// build logs quiet when there's nothing to upload.
export default withSentryConfig(nextConfig, {
  silent: true,
  // Route Sentry's browser requests through your own domain to dodge ad
  // blockers that would otherwise drop error reports.
  tunnelRoute: '/monitoring',
  // Strip the Sentry SDK debug logging from the client bundle to save a few KB.
  webpack: { treeshake: { removeDebugLogging: true } },
});
