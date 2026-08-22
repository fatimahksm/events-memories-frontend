'use client';

import { useState } from 'react';
import type { Dictionary } from '@/i18n/dictionary';
import type { MediaItem } from '@/types/media';

export function MediaGrid({ items, dictionary, liked, onLike }: { items: MediaItem[]; dictionary: Dictionary; liked: Set<string>; onLike: (item: MediaItem) => void }) {
  const [viewer, setViewer] = useState<MediaItem | null>(null);
  return <>
    <div className="masonry">{items.map((item) => <article className="memory-card" key={item.id}><div className="memory-visual">{item.mediaType === 'IMAGE' ? <button className="media-open" onClick={() => setViewer(item)}><img src={item.thumbnailUrl || item.url || ''} alt="" loading="lazy" decoding="async" /></button> : <video src={item.renditionUrl || item.url || ''} poster={item.thumbnailUrl ?? undefined} controls preload="metadata" />}<button className={`memory-like ${liked.has(item.id) ? 'is-liked' : ''}`} onClick={() => onLike(item)} aria-label={liked.has(item.id) ? dictionary.album.liked : dictionary.album.like}><HeartIcon /><span>{item.likes}</span></button></div><div className="memory-meta"><span>{item.guestName || 'Guest'}</span></div></article>)}</div>
    {viewer && <div className="lightbox" onClick={() => setViewer(null)}><button className="close-button" onClick={() => setViewer(null)}>Close</button>{viewer.mediaType === 'IMAGE' ? <img src={viewer.url ?? ''} alt="" /> : <video src={viewer.renditionUrl || viewer.url || ''} poster={viewer.thumbnailUrl ?? undefined} controls autoPlay />}</div>}
  </>;
}

function HeartIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>; }
