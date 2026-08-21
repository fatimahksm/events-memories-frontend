import * as Sentry from '@sentry/nextjs';

/**
 * Server-side error tracking. No-ops entirely unless SENTRY_DSN is set —
 * see .env.example for how to turn this on.
 */
export async function register() {
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
}

export const onRequestError = Sentry.captureRequestError;
