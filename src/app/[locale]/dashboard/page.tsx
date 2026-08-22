'use client';

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ApiError, apiFetch, errorMessage } from '@/lib/api-client';
import { appConfig } from '@/config/app-config';
import { getDictionary, isLocale } from '@/i18n/dictionary';
import type { Dictionary } from '@/i18n/dictionary';
import type { EventSummary } from '@/types/event';
import type { MediaItem, MediaPage, Wish } from '@/types/media';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ThemeEditor } from '@/components/dashboard/ThemeEditor';
import { ShareDialog } from '@/components/dashboard/ShareDialog';

type Me = { role: string };
type VisibilityFilter = 'ALL' | 'PUBLIC' | 'PRIVATE';

export default function OwnerDashboard() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : 'en';
  const d = getDictionary(locale);
  const router = useRouter();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selected, setSelected] = useState<EventSummary | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaPage, setMediaPage] = useState(0);
  const [mediaPages, setMediaPages] = useState(0);
  const [mediaTotal, setMediaTotal] = useState(0);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [tab, setTab] = useState<'media' | 'wishes'>('media');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingDesign, setEditingDesign] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadEvents = useCallback(async () => {
    try {
      const me = await apiFetch<Me>('/auth/me');
      if (me.role === 'SUPER_ADMIN') {
        router.replace(`/${locale}/admin`);
        return;
      }
      const result = await apiFetch<EventSummary[]>('/owner/events');
      setEvents(result);
      setSelected((current) => result.find((event) => event.id === current?.id) ?? result[0] ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) router.replace(`/${locale}/login`);
      else setError(errorMessage(err, d.upload.genericError));
    } finally {
      setLoading(false);
    }
  }, [d.upload.genericError, locale, router]);

  useEffect(() => { void loadEvents(); }, [loadEvents]);
  useEffect(() => { setMediaPage(0); }, [selected, visibilityFilter, dateFrom, dateTo]);
  useEffect(() => {
    if (!selected) {
      setMedia([]);
      setWishes([]);
      return;
    }
    setError('');
    const query = new URLSearchParams({ page: String(mediaPage), size: '24' });
    if (visibilityFilter !== 'ALL') query.set('visibility', visibilityFilter);
    if (dateFrom) query.set('from', new Date(dateFrom).toISOString());
    if (dateTo) query.set('to', new Date(`${dateTo}T23:59:59`).toISOString());
    Promise.all([
      apiFetch<MediaPage>(`/owner/events/${selected.id}/media?${query}`).then((result) => {
        setMedia(result.items);
        setMediaPages(result.totalPages ?? 0);
        setMediaTotal(result.totalElements ?? result.items.length);
      }),
      apiFetch<Wish[]>(`/owner/events/${selected.id}/wishes`).then(setWishes),
    ]).catch((err) => setError(errorMessage(err, d.upload.genericError)));
  }, [d.upload.genericError, mediaPage, selected, visibilityFilter, dateFrom, dateTo]);

  async function changeVisibility(item: MediaItem) {
    if (!selected) return;
    setError('');
    try {
      const value = item.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
      const result = await apiFetch<MediaItem>(`/owner/events/${selected.id}/media/${item.id}/visibility?value=${value}`, { method: 'PATCH' });
      setMedia((current) => current.map((entry) => entry.id === item.id ? result : entry));
    } catch (err) {
      setError(errorMessage(err, d.upload.genericError));
    }
  }

  async function removeMedia(id: string) {
    if (!selected || !confirm('Delete this memory?')) return;
    setError('');
    try {
      await apiFetch(`/owner/events/${selected.id}/media/${id}`, { method: 'DELETE' });
      setMedia((current) => current.filter((item) => item.id !== id));
      setMediaTotal((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(errorMessage(err, d.upload.genericError));
    }
  }

  return (
    <DashboardShell title={d.dashboard.title} locale={locale} logoutLabel={d.common.logout}>
      {error && <p className="form-error api-alert" role="alert">{error}</p>}
      {loading ? <p>{d.common.loading}</p> : events.length === 0 ? (
        <div className="empty-card owner-empty-card"><strong>{d.dashboard.noEventsTitle}</strong><span>{d.dashboard.noEvents}</span></div>
      ) : (
        <>
          {events.length > 1 && (
            <div className="event-switcher-minor">
              <span>{d.dashboard.switchEvent}</span>
              <div className="event-tabs event-tabs--minor">{events.map((event) => <button className={selected?.id === event.id ? 'active' : ''} key={event.id} onClick={() => setSelected(event)}>{event.names}</button>)}</div>
            </div>
          )}
          {selected && (
            <>
              <OwnerEventHero
                event={selected}
                locale={locale}
                dictionary={d}
                onShare={() => setSharing(true)}
                onEditDesign={() => setEditingDesign(true)}
              />
              <div className="dashboard-tabs"><button className={tab === 'media' ? 'active' : ''} onClick={() => setTab('media')}>{d.dashboard.media} ({mediaTotal})</button><button className={tab === 'wishes' ? 'active' : ''} onClick={() => setTab('wishes')}>{d.dashboard.wishes} ({wishes.length})</button></div>
              {tab === 'media' ? (
                <>
                  <div className="media-filters">
                    <div className="segmented">
                      <button type="button" className={visibilityFilter === 'ALL' ? 'active' : ''} onClick={() => setVisibilityFilter('ALL')}>All</button>
                      <button type="button" className={visibilityFilter === 'PUBLIC' ? 'active' : ''} onClick={() => setVisibilityFilter('PUBLIC')}>Public</button>
                      <button type="button" className={visibilityFilter === 'PRIVATE' ? 'active' : ''} onClick={() => setVisibilityFilter('PRIVATE')}>Private</button>
                    </div>
                    <label className="field media-filters__date"><span>From</span><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
                    <label className="field media-filters__date"><span>To</span><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
                    {(visibilityFilter !== 'ALL' || dateFrom || dateTo) && <button className="button button--table" onClick={() => { setVisibilityFilter('ALL'); setDateFrom(''); setDateTo(''); }}>Clear filters</button>}
                  </div>
                  <div className="owner-media-grid">
                    {media.map((item) => (
                      <article key={item.id} className="owner-media-card">
                        <div className="owner-media-preview">{item.url ? (item.mediaType === 'IMAGE' ? <img src={item.thumbnailUrl || item.url} alt="" /> : <video src={item.renditionUrl || item.url} poster={item.thumbnailUrl ?? undefined} controls />) : <span>{item.status}</span>}</div>
                        <div className="owner-media-info"><strong>{item.guestName || 'Guest'}</strong><small>{item.status} · {item.visibility}</small><div><button onClick={() => changeVisibility(item)}>{item.visibility === 'PUBLIC' ? 'Make private' : 'Make public'}</button>{item.url && <a href={item.url} download>Download</a>}<button onClick={() => removeMedia(item.id)}>{d.common.delete}</button></div></div>
                      </article>
                    ))}
                  </div>
                  {media.length === 0 && <div className="professional-empty"><strong>No memories match these filters</strong><span>Try a different visibility or date range.</span></div>}
                  {mediaPages > 1 && <nav className="pagination" aria-label="Media pages"><button className="button button--outline" disabled={mediaPage === 0} onClick={() => setMediaPage((current) => current - 1)}>Previous</button><span>Page {mediaPage + 1} of {mediaPages}</span><button className="button button--outline" disabled={mediaPage + 1 >= mediaPages} onClick={() => setMediaPage((current) => current + 1)}>Next</button></nav>}
                </>
              ) : <div className="wish-list">{wishes.map((wish) => <article key={wish.id}><strong>{wish.guestName || 'Guest'}</strong><p>{wish.message}</p><small>{new Date(wish.createdAt).toLocaleString(locale)}</small></article>)}</div>}
            </>
          )}
        </>
      )}
      {editingDesign && selected && (
        <ThemeEditor
          event={selected}
          dictionary={d}
          scope="owner"
          onClose={() => setEditingDesign(false)}
          onSaved={(saved) => {
            setSelected(saved);
            setEvents((current) => current.map((event) => (event.id === saved.id ? saved : event)));
            setEditingDesign(false);
          }}
        />
      )}
      {sharing && selected && <ShareDialog event={selected} onClose={() => setSharing(false)} />}
    </DashboardShell>
  );
}

function OwnerEventHero({ event, locale, dictionary, onShare, onEditDesign }: { event: EventSummary; locale: string; dictionary: Dictionary; onShare: () => void; onEditDesign: () => void }) {
  const theme = event.theme;
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
  return (
    <section className={`event-hero event-hero--owner event-hero--${theme.templateKey}`} style={style}>
      <div className="event-hero__content">
        <span className="event-hero__kicker">{event.active ? dictionary.dashboard.yourEventLive : dictionary.dashboard.yourEventExpired}</span>
        <h1>{event.names}</h1>
        <RetentionNotice mediaDeleteAt={event.mediaDeleteAt} locale={locale} label={dictionary.dashboard.deleteNotice} />
        <div className="event-hero__actions">
          <a className="button event-main-button" target="_blank" href={`/${locale}/e/${event.slug}`}>{dictionary.dashboard.publicLink}</a>
          <button className="button event-ghost-button" onClick={onShare}>{dictionary.dashboard.shareAndPrint}</button>
          <button className="button event-ghost-button" onClick={onEditDesign}>{dictionary.dashboard.editDesign}</button>
          <a className="button event-ghost-button" href={`${appConfig.apiBaseUrl}/owner/events/${event.id}/download-all`}>{dictionary.dashboard.downloadAll}</a>
        </div>
      </div>
    </section>
  );
}

function RetentionNotice({ mediaDeleteAt, locale, label }: { mediaDeleteAt: string; locale: string; label: string }) {
  const days = Math.ceil((new Date(mediaDeleteAt).getTime() - Date.now()) / 86400000);
  const soon = days <= 14;
  return (
    <p className={soon ? 'retention-notice retention-notice--soon' : 'retention-notice'}>
      {label}: {new Date(mediaDeleteAt).toLocaleDateString(locale)}
      {soon && (days > 0 ? ` · ${days} day${days === 1 ? '' : 's'} left — download what you want to keep` : ' · media may already be removed')}
    </p>
  );
}
