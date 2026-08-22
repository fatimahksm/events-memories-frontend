const HEIGHTS = [280, 340, 220, 300, 260, 320];

/** Shown instead of a bare "Loading…" while the album grid loads — same masonry
 *  slot the real photos land in, so nothing visually jumps once they arrive. */
export function AlbumSkeleton({ count = 6 }: { count?: number }) {
  return <div className="masonry" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="memory-card skeleton-block" style={{ height: HEIGHTS[i % HEIGHTS.length] }} />
    ))}
  </div>;
}
