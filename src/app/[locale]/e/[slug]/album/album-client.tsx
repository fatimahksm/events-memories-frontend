'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { MediaGrid } from '@/components/event/MediaGrid';
import { AlbumSkeleton } from '@/components/event/AlbumSkeleton';
import type { Dictionary, Locale } from '@/i18n/dictionary';
import type { PublicEvent } from '@/types/event';
import type { MediaItem, MediaPage } from '@/types/media';

const PAGE_SIZE = 24;

function visitorId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('eventVisitorId');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('eventVisitorId', id); }
  return id;
}

export function AlbumPageClient({ event, dictionary, locale }: { event: PublicEvent; dictionary: Dictionary; locale: Locale }) {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const arabic = locale === 'ar';
  const eventName = arabic ? event.namesAr || event.names : event.names;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`eventLikes:${event.slug}`) || '[]') as string[];
    setLiked(new Set(saved));
  }, [event.slug]);

  async function load(nextPage: number) {
    setLoading(true); setError('');
    try {
      const result = await apiFetch<MediaPage>(`/public/events/${event.slug}/album/paged?page=${nextPage}&size=${PAGE_SIZE}`);
      setItems(result.items);
      setTotalPages(Math.max(1, result.totalPages ?? 1));
      setPage(result.page ?? nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { setError(errorMessage(err, dictionary.upload.genericError)); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(0); }, [event.slug]);

  async function like(item: MediaItem) {
    if (liked.has(item.id)) return;
    setError('');
    try {
      const result = await apiFetch<{ likes: number; liked: boolean }>(`/public/events/${event.slug}/media/${item.id}/like`, { method: 'POST', headers: { 'X-Visitor-Id': visitorId() } });
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, likes: result.likes } : entry));
      setLiked((current) => {
        const next = new Set(current); next.add(item.id);
        localStorage.setItem(`eventLikes:${event.slug}`, JSON.stringify([...next]));
        return next;
      });
    } catch (err) { setError(errorMessage(err, dictionary.upload.genericError)); }
  }

  return <main dir={arabic ? 'rtl' : 'ltr'} data-color-mode={event.theme.colorMode.toLowerCase()} className="album-page">
    <div className="album-page__header">
      <Link className="button button--ghost" href={`/${locale}/e/${event.slug}`}>{arabic ? '→' : '←'} {dictionary.album.backToEvent}</Link>
      <h1>{eventName}</h1>
    </div>
    <section className="album-section album-section--full">
      {error && <div className="notice notice--error"><strong>Unable to load</strong><span>{error}</span><button onClick={() => load(page)}>{dictionary.common.retry}</button></div>}
      {loading ? <AlbumSkeleton /> : items.length === 0 ? <div className="empty-card"><p>{dictionary.album.empty}</p></div> : <MediaGrid items={items} dictionary={dictionary} liked={liked} onLike={like} />}
      {!loading && totalPages > 1 && <nav className="pagination">
        <button className="button button--outline" disabled={page <= 0} onClick={() => load(page - 1)}>{dictionary.album.previous}</button>
        <span>{page + 1} / {totalPages}</span>
        <button className="button button--outline" disabled={page >= totalPages - 1} onClick={() => load(page + 1)}>{dictionary.album.next}</button>
      </nav>}
    </section>
  </main>;
}
