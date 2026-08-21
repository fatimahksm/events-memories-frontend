'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import QRCode from 'qrcode';
import type { EventSummary } from '@/types/event';

export function ShareDialog({ event, onClose }: { event: EventSummary; onClose: () => void }) {
  const [links, setLinks] = useState({ publicUrl: '', qr: '' });
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const locale = window.location.pathname.split('/')[1] || 'en';
    const publicUrl = `${window.location.origin}/${locale}/e/${event.slug}`;
    QRCode.toDataURL(publicUrl, { width: 420, margin: 1, color: { dark: '#07142F', light: '#FFFFFF' }, errorCorrectionLevel: 'H' }).then((qr) => setLinks({ publicUrl, qr }));
  }, [event.id, event.slug]);

  async function copy() {
    await navigator.clipboard.writeText(links.publicUrl);
    setCopied('public');
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <div className="share-dialog" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <div className="share-card">
        <div className="share-card__header">
          <div><span className="eyebrow">EVENT ACCESS</span><h3>Links, QR code & table card</h3></div>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="share-card__body">
          <div className="share-card__qr">
            {links.qr && <img src={links.qr} alt="Event QR code" />}
            <a className="button button--outline" href={links.qr} download={`${event.slug}-qr.png`}>Download QR</a>
            <button className="button button--primary" onClick={() => window.print()}>Print table card</button>
          </div>
          <div className="link-stack">
            <div className="copy-link"><span>Public guest link</span><div><code>{links.publicUrl}</code><button onClick={copy}>{copied === 'public' ? 'Copied' : 'Copy'}</button></div></div>
            <a className="button button--primary" href={links.publicUrl} target="_blank">Open public event</a>
            <p className="share-card__hint">Guests scan the QR code or open the link to view the album and upload their own photos and videos.</p>
          </div>
        </div>
      </div>
      <div className="print-card" style={{ '--print-accent': event.theme.accentColor } as CSSProperties}>
        <span className="print-card__kicker">Scan to share your memories</span>
        <strong>{event.names}</strong>
        {links.qr && <img src={links.qr} alt="" />}
        <small>Brava Event Memories</small>
      </div>
    </div>
  );
}
