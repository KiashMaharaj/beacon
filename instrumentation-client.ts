// Sentry runs in the browser. It stays completely inert until a DSN is
// provided via NEXT_PUBLIC_SENTRY_DSN in the environment, so nothing is sent
// (and no requests are made) until you wire up the DSN in Vercel.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  // Keep sampling modest so the free tier lasts; bump if you need more detail.
  tracesSampleRate: 0.1,
  // Session replay is opt-in; leave it off until you decide you want it.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});

// Lets Sentry trace client-side navigations in the App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
