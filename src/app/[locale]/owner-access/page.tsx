'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { getDictionary, isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';

type Me = { role: string };

export default function OwnerAccessPage() {
  return <Suspense fallback={null}><OwnerAccessResolver /></Suspense>;
}

function OwnerAccessResolver() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : 'en';
  const d = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setFailed(true); return; }
    let cancelled = false;
    apiFetch<Me>('/auth/owner-access', { method: 'POST', body: JSON.stringify({ token }) })
      .then(() => { if (!cancelled) router.replace(`/${locale}/dashboard`); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [token, locale, router]);

  if (failed) return (
    <main className="system-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <BrandLogo />
      <div>
        <span>ACCESS LINK</span>
        <h1>{d.auth.ownerAccessInvalidTitle}</h1>
        <p>{d.auth.ownerAccessInvalidBody}</p>
      </div>
    </main>
  );

  return (
    <main className="system-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <BrandLogo />
      <div className="owner-access-loading">
        <span className="owner-access-spinner" aria-hidden="true" />
        <p>{d.auth.ownerAccessVerifying}</p>
      </div>
    </main>
  );
}
