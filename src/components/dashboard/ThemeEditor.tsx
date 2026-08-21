'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { apiFetch, errorMessage } from '@/lib/api-client';
import type { EventSummary } from '@/types/event';
import type { Dictionary } from '@/i18n/dictionary';

export function ThemeEditor({ event, dictionary, onSaved }: { event: EventSummary; dictionary: Dictionary; onSaved: (event: EventSummary) => void }) {
  const [theme, setTheme] = useState(event.theme);
  const [content, setContent] = useState({ names: event.names, quote: event.quote || '', namesAr: event.namesAr || '', quoteAr: event.quoteAr || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { setTheme(event.theme); setContent({ names: event.names, quote: event.quote || '', namesAr: event.namesAr || '', quoteAr: event.quoteAr || '' }); }, [event]);

  async function uploadBackground(change: ChangeEvent<HTMLInputElement>) {
    const file = change.target.files?.[0];
    change.target.value = '';
    if (!file) return;
    setUploading(true); setError('');
    try {
      const body = new FormData(); body.append('file', file);
      const uploaded = await apiFetch<{ url: string }>('/admin/theme-assets', { method: 'POST', body });
      setTheme((current) => ({ ...current, backgroundImageUrl: uploaded.url }));
    } catch (err) { setError(errorMessage(err, 'The background could not be uploaded.')); }
    finally { setUploading(false); }
  }

  async function submit(form: FormEvent) {
    form.preventDefault(); setBusy(true); setError('');
    try {
      await apiFetch<EventSummary>(`/admin/events/${event.id}`, { method: 'PUT', body: JSON.stringify({ ...content, quote: content.quote || null, namesAr: content.namesAr || null, quoteAr: content.quoteAr || null, eventDate: event.eventDate || null, expiresAt: event.expiresAt, mediaDeleteAt: event.mediaDeleteAt, active: event.active }) });
      const saved = await apiFetch<EventSummary>(`/admin/events/${event.id}/theme`, { method: 'PUT', body: JSON.stringify(theme) });
      onSaved(saved);
    } catch (err) { setError(errorMessage(err, dictionary.upload.genericError)); }
    finally { setBusy(false); }
  }

  return <div className="theme-editor-stack"><EventShareTools event={event} /><form className="admin-form theme-editor" onSubmit={submit}><h2>Content & design: {event.names}</h2><label className="field"><span>Event name — English</span><input value={content.names} maxLength={180} required onChange={(change) => setContent({ ...content, names: change.target.value })} /></label><label className="field"><span>Event name — Arabic</span><input dir="rtl" value={content.namesAr} maxLength={180} placeholder="اسم المناسبة بالعربية" onChange={(change) => setContent({ ...content, namesAr: change.target.value })} /></label><label className="field"><span>Quote — English</span><textarea rows={3} value={content.quote} maxLength={500} onChange={(change) => setContent({ ...content, quote: change.target.value })} /></label><label className="field"><span>Quote — Arabic</span><textarea dir="rtl" rows={3} value={content.quoteAr} maxLength={500} placeholder="العبارة بالعربية" onChange={(change) => setContent({ ...content, quoteAr: change.target.value })} /></label><label className="background-upload background-upload--compact"><input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadBackground} />{theme.backgroundImageUrl ? <img src={theme.backgroundImageUrl} alt="Event background" /> : <span className="upload-placeholder"><strong>{uploading ? 'Uploading…' : 'Upload event background'}</strong><small>JPG, PNG or WEBP · max 15 MB</small></span>}<em>{theme.backgroundImageUrl ? 'Replace image' : 'Browse files'}</em></label><label className="field"><span>Template</span><select value={theme.templateKey} onChange={(change) => setTheme({ ...theme, templateKey: change.target.value })}><option value="elegant">Elegant</option><option value="minimal">Minimal</option><option value="romantic">Romantic</option></select></label><div className="color-grid"><label className="field"><span>{dictionary.admin.primary}</span><input type="color" value={theme.primaryColor} onChange={(change) => setTheme({ ...theme, primaryColor: change.target.value })} /></label><label className="field"><span>{dictionary.admin.accent}</span><input type="color" value={theme.accentColor} onChange={(change) => setTheme({ ...theme, accentColor: change.target.value })} /></label><label className="field"><span>{dictionary.admin.text}</span><input type="color" value={theme.textColor} onChange={(change) => setTheme({ ...theme, textColor: change.target.value })} /></label></div><label className="field"><span>{dictionary.admin.font}</span><select value={theme.fontFamily} onChange={(change) => setTheme({ ...theme, fontFamily: change.target.value })}><option value="Georgia, serif">Georgia</option><option value="Inter, sans-serif">Inter</option><option value="'Times New Roman', serif">Classic Serif</option></select></label><label className="field"><span>{dictionary.admin.overlay}: {theme.overlayOpacity.toFixed(2)}</span><input type="range" min="0" max="0.85" step="0.05" value={theme.overlayOpacity} onChange={(change) => setTheme({ ...theme, overlayOpacity: Number(change.target.value) })} /></label><label className="field"><span>{dictionary.admin.radius}: {theme.buttonRadiusPx}px</span><input type="range" min="0" max="999" step="4" value={theme.buttonRadiusPx} onChange={(change) => setTheme({ ...theme, buttonRadiusPx: Number(change.target.value) })} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--dark" disabled={busy || uploading}>{busy ? dictionary.common.loading : dictionary.common.save}</button></form></div>;
}

function EventShareTools({ event }: { event: EventSummary }) {
  const [links, setLinks] = useState({ publicUrl: '', adminUrl: '', qr: '' });
  const [copied, setCopied] = useState('');
  useEffect(() => {
    const locale = window.location.pathname.split('/')[1] || 'en';
    const publicUrl = `${window.location.origin}/${locale}/e/${event.slug}`;
    const adminUrl = `${window.location.origin}/${locale}/admin?event=${event.id}`;
    QRCode.toDataURL(publicUrl, { width: 260, margin: 1, color: { dark: '#07142F', light: '#FFFFFF' }, errorCorrectionLevel: 'H' }).then((qr) => setLinks({ publicUrl, adminUrl, qr }));
  }, [event.id, event.slug]);
  async function copy(label: string, value: string) { await navigator.clipboard.writeText(value); setCopied(label); setTimeout(() => setCopied(''), 1500); }
  return <section className="admin-form event-share-tools"><div><span className="eyebrow">EVENT ACCESS</span><h2>Links and QR code</h2><p>Super Admin access remains available here at any time.</p></div><div className="event-share-tools__body">{links.qr && <div className="qr-card"><img src={links.qr} alt="Event QR code" /><a className="button button--outline" href={links.qr} download={`${event.slug}-qr.png`}>Download QR</a></div>}<div className="link-stack"><div className="copy-link"><span>Public guest link</span><div><code>{links.publicUrl}</code><button onClick={() => copy('public', links.publicUrl)}>{copied === 'public' ? 'Copied' : 'Copy'}</button></div></div><div className="copy-link"><span>Admin management link</span><div><code>{links.adminUrl}</code><button onClick={() => copy('admin', links.adminUrl)}>{copied === 'admin' ? 'Copied' : 'Copy'}</button></div></div><a className="button button--primary" href={links.publicUrl} target="_blank">Open public event</a></div></div></section>;
}
