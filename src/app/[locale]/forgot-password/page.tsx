'use client';
import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { getDictionary, isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { AuthVisualPanel } from '@/components/ui/AuthVisualPanel';

export default function ForgotPasswordPage() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : 'en';
  const d = getDictionary(locale);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, d.upload.genericError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <AuthVisualPanel />
      <section className="auth-form-side">
        <div className="auth-mobile-brand"><BrandLogo /></div>
        {sent ? (
          <div className="auth-card">
            <span className="auth-eyebrow">ACCOUNT ACCESS</span>
            <h1>{d.auth.forgotPasswordTitle}</h1>
            <div className="notice notice--success"><strong>Link sent</strong><span>{d.auth.forgotPasswordSent}</span></div>
            <a className="button button--primary button--wide" href={`/${locale}/login`}>{d.auth.backToLogin}</a>
          </div>
        ) : (
          <form className="auth-card" onSubmit={submit}>
            <span className="auth-eyebrow">ACCOUNT ACCESS</span>
            <h1>{d.auth.forgotPasswordTitle}</h1>
            <p>{d.auth.forgotPasswordSubtitle}</p>
            <label className="field"><span>{d.auth.email}</span><input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></label>
            {error && <div className="notice notice--error" role="alert"><strong>{d.upload.genericError}</strong><span>{error}</span></div>}
            <button className="button button--primary button--wide" disabled={busy}>{busy ? d.common.loading : d.auth.forgotPasswordButton}</button>
            <small className="auth-switch"><a href={`/${locale}/login`}>{d.auth.backToLogin}</a></small>
          </form>
        )}
      </section>
    </main>
  );
}
