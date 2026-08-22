import { isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const metadata = { title: 'Privacy — Draft' };

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : 'en';
  return (
    <main className="legal-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="legal-page__header"><BrandLogo compact /></div>
      <article className="legal-page__body">
        <div className="notice notice--error" role="alert">
          <strong>Draft — not reviewed</strong>
          <span>This page describes how the product currently works, in plain language. It is not legal advice, has not been reviewed by a lawyer, and should not be relied on as a real privacy policy until it has been.</span>
        </div>

        <h1>Privacy — how this product handles data today</h1>

        <h2>What's collected</h2>
        <p>When a guest uploads to an event album: the photo or video file itself, an optional display name they type in, and whether they marked it public or private. Liking a photo is tied to a random identifier generated in the guest's browser, not to any personal account. Event owners and the Super Admin have an email address and a password, and sign in with them the same way.</p>

        <h2>Where it's stored</h2>
        <p>Media files are stored in Cloudflare R2 (or, in local development, on the server's own disk). Account and event information is stored in a PostgreSQL database. Photos and videos are scanned for malware before they become visible in an album.</p>

        <h2>Who can see what</h2>
        <p>A guest chooses Public or Private when uploading. Public media is visible to anyone with the event's link. Private media is visible only to the event's owner and the Super Admin. Event owners can see and manage all media for their own events; they cannot see other owners' events.</p>

        <h2>How long it's kept</h2>
        <p>Each event has an expiry date and a media-deletion date set when it's created. After the deletion date passes, media for that event is automatically removed by a scheduled process.</p>

        <h2>Cookies</h2>
        <p>The product sets one cookie to keep you signed in (as an event owner or the Super Admin). It isn't used for advertising or tracking, and no third-party analytics or ad-tracking scripts are currently included in the product.</p>

        <h2>Contact</h2>
        <p>[Add a real contact email or address here before publishing this page.]</p>
      </article>
    </main>
  );
}
