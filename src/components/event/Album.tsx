'use client';

import { useEffect, useState } from 'react';
import { apiFetch, errorMessage } from '@/lib/api-client';
import type { Dictionary } from '@/i18n/dictionary';
import type { MediaItem, MediaPage } from '@/types/media';

function visitorId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('eventVisitorId');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('eventVisitorId', id); }
  return id;
}

export function Album({ slug, dictionary, refreshKey }: { slug: string; dictionary: Dictionary; refreshKey: number }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState<MediaItem | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`eventLikes:${slug}`) || '[]') as string[];
    setLiked(new Set(saved));
  }, [slug]);

  async function load(nextCursor?: string | null, append = false) {
    setLoading(true); setError('');
    try {
      const query = new URLSearchParams({ size: '50' });
      if (nextCursor) query.set('cursor', nextCursor);
      const result = await apiFetch<MediaPage>(`/public/events/${slug}/album?${query}`);
      setItems((current) => append ? dedupe([...current, ...result.items]) : result.items);
      setCursor(result.nextCursor ?? null);
      setHasMore(Boolean(result.hasMore));
    } catch (err) { setError(errorMessage(err, dictionary.upload.genericError)); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(null, false); }, [slug, refreshKey]);

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

  return <section id="album" className="album-section"><div className="section-heading"><span>ALBUM</span><h2>{dictionary.album.title}</h2><p>{dictionary.album.subtitle}</p></div>{error && <div className="notice notice--error"><strong>Unable to load</strong><span>{error}</span><button onClick={() => load(cursor, false)}>{dictionary.common.retry}</button></div>}{!loading && items.length === 0 ? <div className="empty-card"><p>{dictionary.album.empty}</p></div> : <div className="masonry">{items.map((item) => <article className="memory-card" key={item.id}><div className="memory-visual">{item.mediaType === 'IMAGE' ? <button className="media-open" onClick={() => setViewer(item)}><img src={item.url ?? ''} alt="" loading="lazy" decoding="async" /></button> : <video src={item.url ?? ''} controls preload="metadata" />}<button className={`memory-like ${liked.has(item.id) ? 'is-liked' : ''}`} onClick={() => like(item)} aria-label={liked.has(item.id) ? dictionary.album.liked : dictionary.album.like}><HeartIcon /><span>{item.likes}</span></button></div><div className="memory-meta"><span>{item.guestName || 'Guest'}</span></div></article>)}</div>}{loading && <div className="loader">{dictionary.common.loading}</div>}{hasMore && !loading && <button className="button load-more" onClick={() => load(cursor, true)}>{dictionary.album.loadMore}</button>}{viewer && <div className="lightbox" onClick={() => setViewer(null)}><button className="close-button" onClick={() => setViewer(null)}>Close</button>{viewer.mediaType === 'IMAGE' ? <img src={viewer.url ?? ''} alt="" /> : <video src={viewer.url ?? ''} controls autoPlay />}</div>}</section>;
}

function HeartIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>; }
function dedupe(items: MediaItem[]) { return [...new Map(items.map((item) => [item.id, item])).values()]; }
