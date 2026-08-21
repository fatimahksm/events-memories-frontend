'use client';
import './globals.css';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
