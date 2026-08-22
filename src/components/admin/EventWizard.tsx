'use client';

import { ChangeEvent, CSSProperties, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { FONT_OPTIONS } from '@/lib/fonts';
import type { EventSummary, EventTheme } from '@/types/event';

type Owner = { id: string; displayName: string; email: string; enabled: boolean };
type Details = { ownerId: string; names: string; quote: string; namesAr: string; quoteAr: string; eventDate: string; expiresAt: string; mediaDeleteAt: string; slug: string };

const defaultTheme: EventTheme = {
  templateKey: 'elegant', backgroundImageUrl: null, primaryColor: '#F7F9FF',
  accentColor: '#246BFD', textColor: '#FFFFFF', overlayOpacity: .42,
  fontFamily: FONT_OPTIONS[0].value, buttonRadiusPx: 28,
  colorMode: 'DARK', backgroundPositionX: 50, backgroundPositionY: 50, backgroundFit: 'COVER',
};
const emptyDetails: Details = { ownerId: '', names: '', quote: '', namesAr: '', quoteAr: '', eventDate: '', expiresAt: '', mediaDeleteAt: '', slug: '' };
const steps = ['Event details', 'Design & preview', 'Publish'];

export function EventWizard({ owners, locale, onCreated }: { owners: Owner[]; locale: string; onCreated: (event: EventSummary) => void }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullPreview, setFullPreview] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ event: EventSummary; publicUrl: string; adminUrl: string; ownerLoginUrl: string; qr: string } | null>(null);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [theme, setTheme] = useState<EventTheme>(defaultTheme);
  const canContinue = useMemo(() => step !== 0 || Boolean(details.ownerId && details.names.trim() && details.expiresAt && details.mediaDeleteAt), [details, step]);

  const previewStyle = {
    '--preview-text': theme.textColor,
    '--preview-accent': theme.accentColor,
    '--preview-primary': theme.primaryColor,
    '--preview-overlay': theme.overlayOpacity,
    '--preview-radius': `${theme.buttonRadiusPx}px`,
    '--preview-font': theme.fontFamily,
    backgroundColor: theme.primaryColor,
    backgroundImage: theme.backgroundImageUrl
      ? `linear-gradient(rgba(2,10,28,${theme.overlayOpacity}),rgba(2,10,28,${Math.min(theme.overlayOpacity + .1, .9)})),url("${theme.backgroundImageUrl}")`
      : `linear-gradient(135deg,${theme.primaryColor},${theme.accentColor})`,
    backgroundPosition: `${theme.backgroundPositionX}% ${theme.backgroundPositionY}%`,
    backgroundSize: theme.backgroundFit === 'CONTAIN' ? 'contain' : 'cover',
  } as CSSProperties;

  async function uploadBackground(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const uploaded = await apiFetch<{ url: string }>('/admin/theme-assets', { method: 'POST', body });
      setTheme((current) => ({ ...current, backgroundImageUrl: uploaded.url }));
    } catch (err) {
      setError(errorMessage(err, 'The background could not be uploaded.'));
    } finally {
      setUploading(false);
    }
  }

  async function publish() {
    setBusy(true);
    setError('');
    try {
      const event = {
        ownerId: details.ownerId,
        names: details.names.trim(),
        quote: details.quote.trim() || null,
        namesAr: details.namesAr.trim() || null,
        quoteAr: details.quoteAr.trim() || null,
        eventDate: details.eventDate || null,
        expiresAt: new Date(details.expiresAt).toISOString(),
        mediaDeleteAt: new Date(details.mediaDeleteAt).toISOString(),
        slug: details.slug.trim() || null,
      };
      const created = await apiFetch<EventSummary>('/admin/events/publish', {
        method: 'POST', body: JSON.stringify({ event, theme }),
      });
      const origin = window.location.origin;
      const publicUrl = `${origin}/${locale}/e/${created.slug}`;
      const adminUrl = `${origin}/${locale}/admin?event=${created.id}`;
      const ownerLoginUrl = `${origin}/${locale}/login`;
      const qr = await QRCode.toDataURL(publicUrl, { width: 320, margin: 1, color: { dark: '#07142F', light: '#FFFFFF' }, errorCorrectionLevel: 'H' });
      setResult({ event: created, publicUrl, adminUrl, ownerLoginUrl, qr });
      onCreated(created);
    } catch (err) {
      setError(errorMessage(err, 'The event could not be published. Nothing was partially saved; review the information and try again.'));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep(0); setResult(null); setError(''); setDetails(emptyDetails); setTheme(defaultTheme);
  }

  if (result) return (
    <section className="publish-success">
      <div className="success-orbit"><span /></div><p>EVENT PUBLISHED</p><h2>{result.event.names} is ready</h2>
      <span>The exact design shown in preview is now live.</span>
      <div className="publish-result-grid"><div className="qr-card"><img src={result.qr} alt="Event QR code" /><a className="button button--outline" href={result.qr} download={`${result.event.slug}-qr.png`}>Download QR code</a></div><div className="link-stack"><CopyLink label="Public guest link" value={result.publicUrl} /><CopyLink label="Owner login (email + password)" value={result.ownerLoginUrl} /><CopyLink label="Admin management link" value={result.adminUrl} /><div className="publish-actions"><a className="button button--primary" href={result.publicUrl} target="_blank">Open public event</a><button className="button button--ghost" onClick={reset}>Create another event</button></div></div></div>
    </section>
  );

  return (
    <section className="event-wizard">
      <div className="wizard-header"><div><span>GUIDED EVENT BUILDER</span><h2>Create a complete event experience</h2><p>Design and verify the guest page before publishing.</p></div><strong>{step + 1}<small>/ {steps.length}</small></strong></div>
      <div className="wizard-progress">{steps.map((label, index) => <button key={label} className={index === step ? 'active' : index < step ? 'complete' : ''} onClick={() => index < step && setStep(index)}><span>{index + 1}</span><em>{label}</em></button>)}</div>
      {error && <div className="notice notice--error" role="alert"><strong>Action required</strong><span>{error}</span></div>}
      <div className="wizard-body">
        {step === 0 && <EventDetails details={details} owners={owners} onChange={setDetails} />}
        {step === 1 && (
          <div className="wizard-panel wizard-panel--design">
            <div className="panel-heading"><span>02</span><div><h3>Design with live preview</h3><p>Every change below appears immediately in the guest experience.</p></div></div>
            <div className="live-design-layout">
              <div className="design-sidebar">
                <div className="theme-options">{['elegant', 'minimal', 'romantic'].map((key) => <button className={theme.templateKey === key ? 'active' : ''} key={key} onClick={() => setTheme({ ...theme, templateKey: key })}><span className={`theme-swatch theme-swatch--${key}`} /><strong>{key[0].toUpperCase() + key.slice(1)}</strong><small>{key === 'elegant' ? 'Editorial and timeless' : key === 'minimal' ? 'Clean and contemporary' : 'Soft and expressive'}</small></button>)}</div>
                <label className="background-upload background-upload--compact"><input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadBackground} />{theme.backgroundImageUrl ? <img src={theme.backgroundImageUrl} alt="Selected background" /> : <span className="upload-placeholder"><strong>{uploading ? 'Uploading background…' : 'Upload background image'}</strong><small>JPG, PNG or WEBP · max 15 MB</small></span>}<em>{theme.backgroundImageUrl ? 'Replace image' : 'Browse files'}</em></label>
                <div className="design-controls"><div className="color-control"><ColorControl label="Primary" value={theme.primaryColor} onChange={(primaryColor) => setTheme({ ...theme, primaryColor })} /><ColorControl label="Accent" value={theme.accentColor} onChange={(accentColor) => setTheme({ ...theme, accentColor })} /><ColorControl label="Text" value={theme.textColor} onChange={(textColor) => setTheme({ ...theme, textColor })} /></div><label className="field"><span>Typography</span><select value={theme.fontFamily} onChange={(event) => setTheme({ ...theme, fontFamily: event.target.value })}>{FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="range-field"><span>Background overlay <strong>{Math.round(theme.overlayOpacity * 100)}%</strong></span><input type="range" min="0" max="0.85" step="0.05" value={theme.overlayOpacity} onChange={(event) => setTheme({ ...theme, overlayOpacity: Number(event.target.value) })} /></label><label className="range-field"><span>Button radius <strong>{theme.buttonRadiusPx}px</strong></span><input type="range" min="0" max="48" step="2" value={theme.buttonRadiusPx} onChange={(event) => setTheme({ ...theme, buttonRadiusPx: Number(event.target.value) })} /></label><div className="segmented-field"><span>Page mode</span><div className="segmented"><button type="button" className={theme.colorMode === 'DARK' ? 'active' : ''} onClick={() => setTheme({ ...theme, colorMode: 'DARK' })}>Dark</button><button type="button" className={theme.colorMode === 'LIGHT' ? 'active' : ''} onClick={() => setTheme({ ...theme, colorMode: 'LIGHT' })}>Light</button></div><small>Default look for the album, wishes and footer. Guests can switch themselves too.</small></div><div className="segmented-field"><span>Background fit</span><div className="segmented"><button type="button" className={theme.backgroundFit === 'COVER' ? 'active' : ''} onClick={() => setTheme({ ...theme, backgroundFit: 'COVER' })}>Fill</button><button type="button" className={theme.backgroundFit === 'CONTAIN' ? 'active' : ''} onClick={() => setTheme({ ...theme, backgroundFit: 'CONTAIN' })}>Fit</button></div></div><label className="range-field"><span>Background position — horizontal <strong>{theme.backgroundPositionX}%</strong></span><input type="range" min="0" max="100" step="1" value={theme.backgroundPositionX} onChange={(event) => setTheme({ ...theme, backgroundPositionX: Number(event.target.value) })} /></label><label className="range-field"><span>Background position — vertical <strong>{theme.backgroundPositionY}%</strong></span><input type="range" min="0" max="100" step="1" value={theme.backgroundPositionY} onChange={(event) => setTheme({ ...theme, backgroundPositionY: Number(event.target.value) })} /></label></div>
              </div>
              <div className="live-preview-column"><div className="preview-toolbar"><div><strong>Live guest preview</strong><span>Updates instantly</span></div><button className="button button--outline" onClick={() => setFullPreview(true)}>Open full screen</button></div><EventPreview details={details} theme={theme} style={previewStyle} /></div>
            </div>
          </div>
        )}
        {step === 2 && <PublishReview details={details} theme={theme} owners={owners} previewStyle={previewStyle} onPreview={() => setFullPreview(true)} />}
      </div>
      <div className="wizard-footer"><button className="button button--ghost" disabled={step === 0 || busy} onClick={() => setStep((current) => current - 1)}>Back</button>{step < 2 ? <button className="button button--primary" disabled={!canContinue || uploading} onClick={() => setStep((current) => current + 1)}>Continue</button> : <button className="button button--primary" disabled={busy} onClick={publish}>{busy ? 'Publishing event…' : 'Publish event'}</button>}</div>
      {fullPreview && <div className="fullscreen-preview" role="dialog" aria-modal="true" aria-label="Full screen event preview"><button className="fullscreen-preview__close" onClick={() => setFullPreview(false)}>Close preview</button><EventPreview details={details} theme={theme} style={previewStyle} full /></div>}
    </section>
  );
}

function EventDetails({ details, owners, onChange }: { details: Details; owners: Owner[]; onChange: (details: Details) => void }) {
  return <div className="wizard-panel"><div className="panel-heading"><span>01</span><div><h3>Event details</h3><p>Add English and optional Arabic content. Each language appears only when selected by the guest.</p></div></div><div className="form-grid"><label className="field"><span>Event owner</span><select value={details.ownerId} onChange={(event) => onChange({ ...details, ownerId: event.target.value })} required><option value="">Select an active owner</option>{owners.filter((owner) => owner.enabled).map((owner) => <option value={owner.id} key={owner.id}>{owner.displayName} — {owner.email}</option>)}</select></label><label className="field"><span>Event name — English</span><input value={details.names} maxLength={180} placeholder="Maya & Karim" onChange={(event) => onChange({ ...details, names: event.target.value })} /></label><label className="field"><span>Event name — Arabic</span><input dir="rtl" value={details.namesAr} maxLength={180} placeholder="مايا وكريم" onChange={(event) => onChange({ ...details, namesAr: event.target.value })} /></label><label className="field"><span>Quote — English</span><textarea rows={3} value={details.quote} maxLength={500} placeholder="A short welcome message" onChange={(event) => onChange({ ...details, quote: event.target.value })} /></label><label className="field"><span>Quote — Arabic</span><textarea dir="rtl" rows={3} value={details.quoteAr} maxLength={500} placeholder="عبارة ترحيبية قصيرة" onChange={(event) => onChange({ ...details, quoteAr: event.target.value })} /></label><label className="field"><span>Event date</span><input type="date" value={details.eventDate} onChange={(event) => onChange({ ...details, eventDate: event.target.value })} /></label><label className="field"><span>Guest access expires</span><input type="datetime-local" value={details.expiresAt} onChange={(event) => onChange({ ...details, expiresAt: event.target.value })} /></label><label className="field"><span>Media retention ends</span><input type="datetime-local" value={details.mediaDeleteAt} onChange={(event) => onChange({ ...details, mediaDeleteAt: event.target.value })} /></label><label className="field"><span>Custom URL slug</span><div className="input-prefix"><span>/e/</span><input value={details.slug} maxLength={140} placeholder="maya-karim" onChange={(event) => onChange({ ...details, slug: event.target.value })} /></div></label></div></div>;
}

function PublishReview({ details, theme, owners, previewStyle, onPreview }: { details: Details; theme: EventTheme; owners: Owner[]; previewStyle: CSSProperties; onPreview: () => void }) {
  return <div className="wizard-panel review-panel"><div className="panel-heading"><span>03</span><div><h3>Ready to publish</h3><p>Confirm the information and the exact saved design.</p></div></div><div className="publish-review-layout"><div className="review-grid"><Review label="Event" value={details.names} /><Review label="Owner" value={owners.find((owner) => owner.id === details.ownerId)?.displayName || 'Not selected'} /><Review label="Public slug" value={details.slug || 'Generated automatically'} /><Review label="Template" value={theme.templateKey} /><Review label="Guest access" value={details.expiresAt ? new Date(details.expiresAt).toLocaleString() : 'Not set'} /><Review label="Media deletion" value={details.mediaDeleteAt ? new Date(details.mediaDeleteAt).toLocaleString() : 'Not set'} /></div><div className="review-preview"><EventPreview details={details} theme={theme} style={previewStyle} /><button className="button button--outline" onClick={onPreview}>Open full screen</button></div></div><div className="security-note"><strong>Atomic secure publishing</strong><p>The event and its complete design are saved together. If any part fails, no unfinished event is created.</p></div></div>;
}

export function EventPreview({ details, theme, style, full = false }: { details: { names: string; quote: string; namesAr: string; quoteAr: string; eventDate: string }; theme: EventTheme; style: CSSProperties; full?: boolean }) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const arabic = language === 'ar';
  const name = arabic ? details.namesAr : details.names;
  const quote = arabic ? details.quoteAr : details.quote;
  return <div className={`event-preview event-preview--${theme.templateKey} ${full ? 'event-preview--fullscreen' : ''}`} style={style} dir={arabic ? 'rtl' : 'ltr'}><button className="preview-language" onClick={() => setLanguage(arabic ? 'en' : 'ar')}>{arabic ? 'EN' : 'ع'}</button>{!full && <div className="preview-browser"><span /><span /><span /><em>Public guest experience</em></div>}<div className="preview-stage"><small>{arabic ? 'مساحة مشتركة للذكريات' : 'WELCOME TO OUR CELEBRATION'}</small><h2>{name || (arabic ? 'أسماء المناسبة' : 'Your event names')}</h2>{details.eventDate && <time>{new Date(`${details.eventDate}T00:00:00`).toLocaleDateString(arabic ? 'ar-LB' : undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</time>}<p>{quote || (arabic ? 'ستظهر عبارة الترحيب هنا.' : 'Your welcome message will appear here.')}</p><div><button>{arabic ? 'أضف ذكرياتك' : 'Upload memories'}</button><button>{arabic ? 'شاهد الألبوم' : 'View album'}</button></div></div></div>;
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span>{label}</span><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><code>{value}</code></label>; }
function Review({ label, value }: { label: string; value: string }) { return <div className="review-item"><span>{label}</span><strong>{value}</strong></div>; }
export function CopyLink({ label, value }: { label: string; value: string }) { const [copied, setCopied] = useState(false); async function copy() { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1600); } return <div className="copy-link"><span>{label}</span><div><code>{value}</code><button onClick={copy}>{copied ? 'Copied' : 'Copy'}</button></div></div>; }
