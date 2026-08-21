'use client';

import type { CSSProperties } from 'react';
import type { PublicEvent } from '@/types/event';
import type { Dictionary, Locale } from '@/i18n/dictionary';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function EventHero({ event, dictionary, locale, onUpload }: { event: PublicEvent; dictionary: Dictionary; locale: Locale; onUpload: () => void }) {
  const theme = event.theme;
  const arabic = locale === 'ar';
  const eventName = arabic ? event.namesAr || event.names : event.names;
  const eventQuote = arabic ? event.quoteAr || event.quote : event.quote;
  const style = {
    '--event-text': theme.textColor,
    '--event-primary': theme.primaryColor,
    '--event-accent': theme.accentColor,
    '--event-radius': `${theme.buttonRadiusPx}px`,
    '--event-font': theme.fontFamily,
    '--event-overlay': String(theme.overlayOpacity),
    backgroundColor: theme.primaryColor,
    backgroundImage: theme.backgroundImageUrl
      ? `linear-gradient(rgba(2,10,28,${theme.overlayOpacity}),rgba(2,10,28,${Math.min(theme.overlayOpacity + .1, .9)})),url("${theme.backgroundImageUrl}")`
      : `linear-gradient(135deg,${theme.primaryColor},${theme.accentColor})`,
  } as CSSProperties;

  return <section className={`event-hero event-hero--${theme.templateKey}`} style={style}><LanguageSwitcher locale={locale} /><div className="event-hero__ornament" /><div className="event-hero__content"><span className="event-hero__kicker">{dictionary.event.memoryLabel}</span><h1>{eventName}</h1>{event.eventDate && <time>{new Intl.DateTimeFormat(locale === 'ar' ? 'ar-LB' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(event.eventDate + 'T00:00:00'))}</time>}{eventQuote && <blockquote>“{eventQuote}”</blockquote>}<div className="event-hero__actions"><button className="button event-main-button" onClick={onUpload}>{dictionary.event.upload}</button><a className="button event-ghost-button" href="#album">{dictionary.event.viewAlbum}</a></div></div><a href="#album" className="scroll-cue" aria-label="Scroll to album" /></section>;
}
