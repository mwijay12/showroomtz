import { cn } from "@/lib/utils"

/**
 * Skeleton — ShowroomTZ premium loading primitives.
 *
 * Every block uses the `.skeleton-block` shimmer sweep from globals.css
 * (a travelling light band tinted with the brand primary) instead of the
 * flat `animate-pulse` grey, so loading states feel like part of the
 * product rather than a browser default.
 *
 * Reduced-motion users get a calm static block — the sweep is disabled
 * globally in globals.css.
 */

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-block h-4 w-full rounded-md", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

function SkeletonCircle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-block rounded-full", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

/** Multi-line text placeholder — last line is short so it reads like prose. */
function SkeletonText({
  lines = 3,
  className,
  lineClassName,
}: {
  lines?: number
  className?: string
  lineClassName?: string
}) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "skeleton-block h-3",
            i === lines - 1 ? "w-2/5" : i % 2 === 0 ? "w-full" : "w-11/12",
            lineClassName
          )}
        />
      ))}
    </div>
  )
}

/** Generic card shell — image band + title + body + footer row. */
function SkeletonCard({
  className,
  withImage = true,
  lines = 2,
}: {
  className?: string
  withImage?: boolean
  lines?: number
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2rem] border border-border bg-card",
        className
      )}
      aria-hidden="true"
    >
      {withImage && (
        <div className="skeleton-block aspect-[16/10] w-full rounded-none" />
      )}
      <div className="space-y-5 p-7">
        <div className="skeleton-block h-4 w-20 rounded-full" />
        <div className="space-y-3">
          <div className="skeleton-block h-6 w-3/4" />
          <SkeletonText lines={lines} />
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-5">
          <div className="skeleton-block h-7 w-28" />
          <div className="skeleton-block h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/** KPI tile used by admin dashboards. */
function SkeletonStat({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-border bg-card p-6",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <div className="skeleton-block h-3 w-24" />
        <div className="skeleton-block h-8 w-8 rounded-xl" />
      </div>
      <div className="skeleton-block h-9 w-32" />
      <div className="skeleton-block h-2.5 w-20" />
    </div>
  )
}

/** Table skeleton — header + n rows with varied column widths. */
function SkeletonTable({
  rows = 6,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex gap-6 border-b border-border bg-muted/40 px-6 py-4">
        {Array.from({ length: columns }).map((_, c) => (
          <div key={c} className="skeleton-block h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-6 border-b border-border/50 px-6 py-5 last:border-0"
        >
          <div className="skeleton-block h-10 w-10 shrink-0 rounded-xl" />
          {Array.from({ length: columns - 1 }).map((_, c) => (
            <div
              key={c}
              className="skeleton-block h-3.5 flex-1"
              style={{ opacity: 1 - r * 0.06 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Full-page shell for route-level loading.tsx files. */
function SkeletonPage({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-12", className)}>
      <div className="mb-14 space-y-5">
        <div className="skeleton-block h-3 w-40 rounded-full" />
        <div className="skeleton-block h-14 w-3/4" />
        <div className="skeleton-block h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  SkeletonCard,
  SkeletonStat,
  SkeletonTable,
  SkeletonPage,
}
