import { isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const metadata = { title: 'Terms of Service' };

const EFFECTIVE_DATE = 'August 2026';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : 'en';
  return (
    <main className="legal-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="legal-page__header"><BrandLogo compact /></div>
      <article className="legal-page__body">
        <h1>Terms of Service</h1>
        <p className="legal-page__meta">Effective {EFFECTIVE_DATE}</p>
        <p>Brava Event Memories is a product built and operated by Brava Technology. It gives event owners — couples, hosts, and companies — a private space to collect the photos and videos their guests capture, and gives those guests a simple way to share them. These terms describe how the product may be used by both.</p>

        <h2>Who this covers</h2>
        <p>An <strong>owner</strong> is the person or organization an event is created for; owner accounts are set up by Brava Technology on their behalf. A <strong>guest</strong> is anyone who opens an event's public link to view the album, upload a photo or video, or leave a wish. By using either role, you agree to these terms.</p>

        <h2>Acceptable use</h2>
        <p>Guests may only upload photos and videos they took themselves or otherwise have the right to share, and must not upload content that is unlawful, infringes someone else's rights, or is abusive, obscene, or harmful. Owners are responsible for moderating their own event — every upload can be made private or removed at any time from the owner dashboard.</p>

        <h2>Content ownership</h2>
        <p>Guests and owners keep ownership of the photos and videos they upload. By uploading, you grant Brava Technology a limited license to store, process (including malware scanning and generating thumbnails or web-friendly versions), and display that content — only as needed to run the album for that event.</p>

        <h2>How long content is kept</h2>
        <p>Every event has a guest-access expiry date and a media retention date, set when Brava Technology creates the event. Once the retention date passes, all media for that event is automatically and permanently deleted. Owners can download everything from their dashboard at any time before that happens — we recommend doing so well before the retention date.</p>

        <h2>Security</h2>
        <p>Every photo and video is scanned for malware before it's visible to anyone. Passwords are never stored in plain text. Sign-in sessions use a secure, browser-protected cookie, and repeated failed sign-in attempts are automatically throttled. Administrative actions on the platform are recorded in an internal audit log.</p>

        <h2>Availability and liability</h2>
        <p>Brava Event Memories is provided on an "as is" basis. While we take the precautions described above and in our Privacy Policy seriously, we can't guarantee the service will be uninterrupted or error-free, and we aren't liable for indirect or consequential losses arising from its use, to the extent permitted by law.</p>

        <h2>Changes to these terms</h2>
        <p>We may update these terms from time to time as the product evolves. The effective date above will change when we do, and continued use of the product after an update means you accept the revised terms.</p>

        <h2>Contact</h2>
        <p>Questions about these terms can be sent to [add your Brava Technology support email here].</p>

        <p className="legal-page__note">This page explains, in plain language, how Brava Event Memories works. It is not a substitute for legal advice.</p>
      </article>
    </main>
  );
}
