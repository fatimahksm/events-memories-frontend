'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import './globals.css';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <html lang="en">
      <body>
        <main className="system-page">
          <span className="brava-brand"><span className="brava-brand__copy"><strong>BRAVA</strong><small>Event Memories</small></span></span>
          <div>
            <span>APPLICATION ERROR</span>
            <h1>Something went wrong</h1>
            <p>Your data is safe. Try again, and contact Brava support if the issue continues.</p>
            <button className="button button--primary" onClick={reset}>Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
