import { isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const metadata = { title: 'Privacy Policy' };

const EFFECTIVE_DATE = 'August 2026';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : 'en';
  return (
    <main className="legal-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="legal-page__header"><BrandLogo compact /></div>
      <article className="legal-page__body">
        <h1>Privacy Policy</h1>
        <p className="legal-page__meta">Effective {EFFECTIVE_DATE}</p>
        <p>Brava Event Memories is a product built and operated by Brava Technology. This page explains what information we collect when an event runs on the platform, how it's protected, and how long we keep it.</p>

        <h2>What we collect</h2>
        <p>When a guest uploads to an event album: the photo or video file itself, an optional display name they type in, and whether they marked it public or private. Liking a photo is tied to a random identifier generated in the guest's own browser, not to any personal account. Event owners and the Brava Technology team sign in with an email address and password.</p>

        <h2>How it's protected</h2>
        <p>Security isn't an afterthought — it's built into how the product handles every upload and every account:</p>
        <ul>
          <li>Every photo and video is scanned for malware before it becomes visible to anyone.</li>
          <li>Passwords are hashed and never stored in plain text.</li>
          <li>Sign-in sessions use a secure, browser-protected cookie that scripts can't read.</li>
          <li>Repeated failed sign-in attempts are automatically rate-limited.</li>
          <li>Access to the platform's systems is restricted to approved applications only.</li>
          <li>Administrative actions — creating an owner, publishing an event, changing access — are recorded in an internal audit log.</li>
        </ul>

        <h2>Where it's stored</h2>
        <p>Media files are stored with Cloudflare R2. Account and event information is stored in a PostgreSQL database operated by Brava Technology.</p>

        <h2>Who can see what</h2>
        <p>A guest chooses Public or Private when uploading. Public media is visible to anyone with the event's link. Private media is visible only to that event's owner and the Brava Technology team. Owners can see and manage all media for their own event; they cannot see other owners' events.</p>

        <h2>How long it's kept</h2>
        <p>Every event has an expiry date and a media-deletion date, set when the event is created. By default, media is deleted 14 days after guest access expires, though this can vary per event. Once that date passes, the event's media is automatically and permanently removed by a scheduled process — there's no way to recover it afterward, so owners are encouraged to download their memories before then.</p>

        <h2>Cookies</h2>
        <p>The product sets one cookie, used only to keep an owner or Brava Technology team member signed in. It isn't used for advertising or tracking, and no third-party analytics or ad-tracking scripts are included in the product.</p>

        <h2>Your data, your say</h2>
        <p>If you'd like to know what data we hold about you, or ask us to remove it sooner than the automatic schedule above, reach out using the contact details below and we'll handle it directly.</p>

        <h2>Contact</h2>
        <p>Questions about this policy, or requests about your data, can be sent to <a href="mailto:bravaatech@gmail.com">bravaatech@gmail.com</a>.</p>

        <p className="legal-page__note">This page explains, in plain language, how Brava Event Memories works. It is not a substitute for legal advice.</p>
      </article>
    </main>
  );
}
