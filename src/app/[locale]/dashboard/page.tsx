'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ApiError, apiFetch, errorMessage } from '@/lib/api-client';
import { appConfig } from '@/config/app-config';
import { getDictionary, isLocale } from '@/i18n/dictionary';
import type { EventSummary } from '@/types/event';
import type { MediaItem, MediaPage, Wish } from '@/types/media';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ThemeEditor } from '@/components/dashboard/ThemeEditor';

type Me = { role: string };

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editingDesign, setEditingDesign] = useState(false);

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
  useEffect(() => { setMediaPage(0); }, [selected]);
  useEffect(() => {
    if (!selected) {
      setMedia([]);
      setWishes([]);
      return;
    }
    setError('');
    Promise.all([
      apiFetch<MediaPage>(`/owner/events/${selected.id}/media?page=${mediaPage}&size=24`).then((result) => {
        setMedia(result.items);
        setMediaPages(result.totalPages ?? 0);
        setMediaTotal(result.totalElements ?? result.items.length);
      }),
      apiFetch<Wish[]>(`/owner/events/${selected.id}/wishes`).then(setWishes),
    ]).catch((err) => setError(errorMessage(err, d.upload.genericError)));
  }, [d.upload.genericError, mediaPage, selected]);

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const deleteValue = String(data.get('deleteAt') || '');
      const created = await apiFetch<EventSummary>('/owner/events', {
        method: 'POST',
        body: JSON.stringify({
          names: data.get('names'), quote: data.get('quote') || null,
          eventDate: data.get('date') || null,
          expiresAt: new Date(String(data.get('expires'))).toISOString(),
          mediaDeleteAt: deleteValue ? new Date(deleteValue).toISOString() : null,
          slug: data.get('slug') || null,
        }),
      });
      form.reset();
      setEvents((current) => [created, ...current]);
      setSelected(created);
    } catch (err) {
      setError(errorMessage(err, d.upload.genericError));
    } finally {
      setBusy(false);
    }
  }

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
      <form className="admin-form owner-event-form" onSubmit={createEvent}>
        <div className="section-heading"><div><span className="eyebrow">Workspace</span><h2>{d.dashboard.newEvent}</h2></div><p>Create another guest experience from your workspace.</p></div>
        <label className="field"><span>{d.dashboard.eventNames}</span><input name="names" required maxLength={180} /></label>
        <label className="field"><span>{d.dashboard.quote}</span><textarea name="quote" rows={2} maxLength={500} /></label>
        <div className="form-grid">
          <label className="field"><span>{d.dashboard.eventDate}</span><input name="date" type="date" /></label>
          <label className="field"><span>{d.dashboard.expires}</span><input name="expires" type="datetime-local" required /></label>
          <label className="field"><span>{d.dashboard.deleteAt}</span><input name="deleteAt" type="datetime-local" /></label>
          <label className="field"><span>{d.dashboard.slug}</span><input name="slug" maxLength={140} /></label>
        </div>
        <button className="button button--dark" disabled={busy}>{busy ? d.common.loading : d.dashboard.create}</button>
      </form>

      {error && <p className="form-error api-alert" role="alert">{error}</p>}
      {loading ? <p>{d.common.loading}</p> : events.length === 0 ? <div className="empty-card">{d.dashboard.noEvents}</div> : (
        <>
          <div className="event-tabs">{events.map((event) => <button className={selected?.id === event.id ? 'active' : ''} key={event.id} onClick={() => setSelected(event)}>{event.names}</button>)}</div>
          {selected && (
            <>
              <section className="event-summary-card">
                <div><span>{selected.active ? 'ACTIVE' : 'EXPIRED'}</span><h2>{selected.names}</h2><p>{d.dashboard.deleteNotice}: {new Date(selected.mediaDeleteAt).toLocaleDateString(locale)}</p></div>
                <div className="summary-actions"><a className="button button--outline" target="_blank" href={`/${locale}/e/${selected.slug}`}>{d.dashboard.publicLink}</a><button className="button button--outline" onClick={() => setEditingDesign(true)}>Edit design & content</button><a className="button button--dark" href={`${appConfig.apiBaseUrl}/owner/events/${selected.id}/download-all`}>{d.dashboard.downloadAll}</a></div>
              </section>
              <div className="dashboard-tabs"><button className={tab === 'media' ? 'active' : ''} onClick={() => setTab('media')}>{d.dashboard.media} ({mediaTotal})</button><button className={tab === 'wishes' ? 'active' : ''} onClick={() => setTab('wishes')}>{d.dashboard.wishes} ({wishes.length})</button></div>
              {tab === 'media' ? (
                <>
                  <div className="owner-media-grid">
                    {media.map((item) => (
                      <article key={item.id} className="owner-media-card">
                        <div className="owner-media-preview">{item.url ? (item.mediaType === 'IMAGE' ? <img src={item.url} alt="" /> : <video src={item.url} controls />) : <span>{item.status}</span>}</div>
                        <div className="owner-media-info"><strong>{item.guestName || 'Guest'}</strong><small>{item.status} · {item.visibility}</small><div><button onClick={() => changeVisibility(item)}>{item.visibility === 'PUBLIC' ? 'Make private' : 'Make public'}</button><button onClick={() => removeMedia(item.id)}>{d.common.delete}</button></div></div>
                      </article>
                    ))}
                  </div>
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
    </DashboardShell>
  );
}
