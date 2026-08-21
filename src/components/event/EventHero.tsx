'use client';

import type { CSSProperties } from 'react';
import type { EventColorMode, PublicEvent } from '@/types/event';
import type { Dictionary, Locale } from '@/i18n/dictionary';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function EventHero({ event, dictionary, locale, colorMode, onToggleColorMode, onUpload }: { event: PublicEvent; dictionary: Dictionary; locale: Locale; colorMode: EventColorMode; onToggleColorMode: () => void; onUpload: () => void }) {
  const theme = event.theme;
  const arabic = locale === 'ar';
  const eventName = arabic ? event.namesAr || event.names : event.names;
  const eventQuote = arabic ? event.quoteAr : event.quote;
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
    backgroundPosition: `${theme.backgroundPositionX}% ${theme.backgroundPositionY}%`,
    backgroundSize: theme.backgroundFit === 'CONTAIN' ? 'contain' : 'cover',
  } as CSSProperties;

  return <section className={`event-hero event-hero--${theme.templateKey}`} style={style}><button className="mode-switcher" onClick={onToggleColorMode} aria-label={colorMode === 'DARK' ? dictionary.event.switchToLight : dictionary.event.switchToDark}>{colorMode === 'DARK' ? <SunIcon /> : <MoonIcon />}</button><LanguageSwitcher locale={locale} /><div className="event-hero__ornament" /><div className="event-hero__content"><span className="event-hero__kicker">{dictionary.event.memoryLabel}</span><h1>{eventName}</h1>{event.eventDate && <time>{new Intl.DateTimeFormat(locale === 'ar' ? 'ar-LB' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(event.eventDate + 'T00:00:00'))}</time>}{eventQuote && <blockquote>“{eventQuote}”</blockquote>}<div className="event-hero__actions"><button className="button event-main-button" onClick={onUpload}>{dictionary.event.upload}</button><a className="button event-ghost-button" href={`/${locale}/e/${event.slug}/album`}>{dictionary.event.viewAlbum}</a></div></div><a href="#album" className="scroll-cue" aria-label="Scroll to album" /></section>;
}

function SunIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>; }
