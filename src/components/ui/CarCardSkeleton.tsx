"use client"

/**
 * CarCardSkeleton — premium vehicle-card placeholder.
 *
 * Mirrors the real card silhouette (16/10 media band, badge, title,
 * spec chips, price + CTA row) and uses the brand-tinted shimmer sweep
 * from globals.css instead of a flat pulse.
 */
export function CarCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-[2rem] border border-border bg-card"
      aria-hidden="true"
    >
      {/* Media band */}
      <div className="skeleton-block relative aspect-[16/10] w-full rounded-none">
        <div className="absolute left-5 top-5 h-6 w-20 rounded-full bg-background/40" />
        <div className="absolute right-5 top-5 h-6 w-16 rounded-full bg-background/40" />
      </div>

      {/* Body */}
      <div className="space-y-5 p-7">
        <div className="skeleton-block h-3 w-28 rounded-full" />
        <div className="space-y-3">
          <div className="skeleton-block h-6 w-4/5" />
          <div className="skeleton-block h-3 w-1/2" />
        </div>

        {/* Spec chips */}
        <div className="flex gap-2">
          <div className="skeleton-block h-7 w-16 rounded-lg" />
          <div className="skeleton-block h-7 w-20 rounded-lg" />
          <div className="skeleton-block h-7 w-14 rounded-lg" />
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between border-t border-border/60 pt-5">
          <div className="space-y-2">
            <div className="skeleton-block h-2.5 w-16" />
            <div className="skeleton-block h-7 w-32" />
          </div>
          <div className="skeleton-block h-11 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/** Grid wrapper so pages can drop in a consistent loading state. */
export function CarGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading vehicles"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-in fade-in"
          style={{ animationDelay: `${i * 70}ms`, animationFillMode: "both" }}
        >
          <CarCardSkeleton />
        </div>
      ))}
      <span className="sr-only">Loading vehicles…</span>
    </div>
  )
}
