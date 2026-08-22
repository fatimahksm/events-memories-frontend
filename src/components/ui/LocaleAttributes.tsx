'use client';
import { useLayoutEffect } from 'react';

/** Owns the <html> lang/dir sync as a Client Component (not the Server Component
 *  layout) so the inline script's `type` genuinely re-evaluates per render: "text/javascript"
 *  during SSR (so the browser executes it before first paint, no flash) and "text/plain" on a
 *  client re-render (soft locale-switch navigation), which is also what avoids React's
 *  dev-only "script tag" warning — see preventing-flash-before-hydration docs.
 *  The useLayoutEffect is a belt-and-braces reapply: it covers React Strict Mode's dev-only
 *  remount (which clears attributes the script set) and guarantees correctness even if the
 *  script itself doesn't re-run. */
export function LocaleAttributes({ locale, dir }: { locale: string; dir: 'ltr' | 'rtl' }) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang=${JSON.stringify(locale)};document.documentElement.dir=${JSON.stringify(dir)};`,
      }}
    />
  );
}
