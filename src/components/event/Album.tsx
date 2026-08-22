'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, errorMessage } from '@/lib/api-client';
import { MediaGrid } from './MediaGrid';
import { AlbumSkeleton } from './AlbumSkeleton';
import type { Dictionary } from '@/i18n/dictionary';
import type { MediaItem, MediaPage } from '@/types/media';

const PREVIEW_SIZE = 12;

function visitorId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('eventVisitorId');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('eventVisitorId', id); }
  return id;
}

export function Album({ slug, locale, dictionary, refreshKey }: { slug: string; locale: string; dictionary: Dictionary; refreshKey: number }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`eventLikes:${slug}`) || '[]') as string[];
    setLiked(new Set(saved));
  }, [slug]);

  async function load() {
    setLoading(true); setError('');
    try {
      const result = await apiFetch<MediaPage>(`/public/events/${slug}/album/paged?page=0&size=${PREVIEW_SIZE}`);
      setItems(result.items);
      setTotalElements(result.totalElements ?? result.items.length);
    } catch (err) { setError(errorMessage(err, dictionary.upload.genericError)); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [slug, refreshKey]);

  async function like(item: MediaItem) {
    if (liked.has(item.id)) return;
    setError('');
    try {
      const result = await apiFetch<{ likes: number; liked: boolean }>(`/public/events/${slug}/media/${item.id}/like`, { method: 'POST', headers: { 'X-Visitor-Id': visitorId() } });
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, likes: result.likes } : entry));
      setLiked((current) => {
        const next = new Set(current); next.add(item.id);
        localStorage.setItem(`eventLikes:${slug}`, JSON.stringify([...next]));
        return next;
      });
    } catch (err) { setError(errorMessage(err, dictionary.upload.genericError)); }
  }

  return <section id="album" className="album-section">
    <div className="section-heading"><span>ALBUM</span><h2>{dictionary.album.title}</h2><p>{dictionary.album.subtitle}</p></div>
    {error && <div className="notice notice--error"><strong>Unable to load</strong><span>{error}</span><button onClick={load}>{dictionary.common.retry}</button></div>}
    {loading ? <AlbumSkeleton /> : items.length === 0 ? <div className="empty-card"><p>{dictionary.album.empty}</p></div> : <MediaGrid items={items} dictionary={dictionary} liked={liked} onLike={like} />}
    {!loading && items.length > 0 && <Link className="button button--outline load-more" href={`/${locale}/e/${slug}/album`}>{dictionary.album.viewAll}{totalElements > items.length ? ` (${totalElements})` : ''}</Link>}
  </section>;
}
