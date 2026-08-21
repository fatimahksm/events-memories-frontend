'use client';
import { FormEvent, Suspense, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { getDictionary, isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { AuthVisualPanel } from '@/components/ui/AuthVisualPanel';

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>;
}

function ResetPasswordForm() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : 'en';
  const d = getDictionary(locale);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, d.auth.resetPasswordInvalid));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <AuthVisualPanel />
      <section className="auth-form-side">
        <div className="auth-mobile-brand"><BrandLogo /></div>
        {!token ? (
          <div className="auth-card">
            <span className="auth-eyebrow">SUPER ADMIN ACCESS</span>
            <h1>{d.auth.ownerAccessInvalidTitle}</h1>
            <p>{d.auth.resetPasswordInvalid}</p>
            <a className="button button--primary button--wide" href={`/${locale}/forgot-password`}>{d.auth.forgotPasswordTitle}</a>
          </div>
        ) : done ? (
          <div className="auth-card">
            <span className="auth-eyebrow">SUPER ADMIN ACCESS</span>
            <h1>{d.auth.resetPasswordTitle}</h1>
            <div className="notice notice--success"><strong>Password reset</strong><span>{d.auth.resetPasswordSuccess}</span></div>
            <a className="button button--primary button--wide" href={`/${locale}/login`}>{d.auth.goToLogin}</a>
          </div>
        ) : (
          <form className="auth-card" onSubmit={submit}>
            <span className="auth-eyebrow">SUPER ADMIN ACCESS</span>
            <h1>{d.auth.resetPasswordTitle}</h1>
            <p>{d.auth.resetPasswordSubtitle}</p>
            <label className="field"><span>{d.auth.newPassword}</span><input type="password" autoComplete="new-password" required minLength={10} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter your new password" /></label>
            {error && <div className="notice notice--error" role="alert"><strong>{d.auth.ownerAccessInvalidTitle}</strong><span>{error}</span></div>}
            <button className="button button--primary button--wide" disabled={busy}>{busy ? d.common.loading : d.auth.resetPasswordButton}</button>
            <small className="auth-switch"><a href={`/${locale}/login`}>{d.auth.backToLogin}</a></small>
          </form>
        )}
      </section>
    </main>
  );
}
