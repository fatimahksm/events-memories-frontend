import * as Sentry from '@sentry/nextjs';

/**
 * Client-side error tracking. No-ops entirely unless NEXT_PUBLIC_SENTRY_DSN
 * is set at build time — see .env.example for how to turn this on.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, tracesSampleRate: 0.1 });
}
