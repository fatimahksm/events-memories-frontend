import { isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const metadata = { title: 'Terms — Draft' };

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : 'en';
  return (
    <main className="legal-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="legal-page__header"><BrandLogo compact /></div>
      <article className="legal-page__body">
        <div className="notice notice--error" role="alert">
          <strong>Draft — not reviewed</strong>
          <span>This is a placeholder structure only. None of the sections below contain real terms — they need to be written (or reviewed) by you or a lawyer before this page is published or linked anywhere real guests or clients will see it.</span>
        </div>

        <h1>Terms of Service — placeholder</h1>
        <p>A real terms page for a product like this would typically cover the sections below. Each one needs real content — nothing here should be treated as binding.</p>

        <h2>Who can use this</h2>
        <p>[Describe who may create an account, and any age requirements.]</p>

        <h2>What guests and owners are responsible for</h2>
        <p>[Describe acceptable use of uploads — e.g. guests may only upload content they have the right to share, and must not upload unlawful or harmful content.]</p>

        <h2>Content ownership</h2>
        <p>[Clarify who owns uploaded photos/videos, and what license, if any, the product needs to store and display them.]</p>

        <h2>Data retention and deletion</h2>
        <p>[State the retention behavior described in the Privacy page, and any guarantees or lack thereof about permanence.]</p>

        <h2>Liability and warranties</h2>
        <p>[This section needs a lawyer — it typically limits liability for service interruptions, data loss, etc.]</p>

        <h2>Changes to these terms</h2>
        <p>[Describe how and when terms may change, and how users will be notified.]</p>

        <h2>Contact</h2>
        <p>[Add a real contact email or address here before publishing this page.]</p>
      </article>
    </main>
  );
}
