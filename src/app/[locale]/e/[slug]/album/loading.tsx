import { AlbumSkeleton } from '@/components/event/AlbumSkeleton';

export default function Loading() {
  return <main className="album-page">
    <div className="album-page__header album-page__header--skeleton">
      <span className="skeleton-block" />
      <h1 className="skeleton-block" />
    </div>
    <section className="album-section album-section--full">
      <AlbumSkeleton />
    </section>
  </main>;
}
