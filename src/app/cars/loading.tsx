import { CarGridSkeleton } from "@/components/ui/CarCardSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function CarsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-12">
      <div className="mb-14 space-y-5">
        <div className="skeleton-block h-3 w-32 rounded-full" />
        <div className="skeleton-block h-12 w-2/3 max-w-lg" />
        <div className="skeleton-block h-4 w-1/2 max-w-md" />
      </div>

      {/* filter rail */}
      <div className="mb-10 flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-block h-11 w-28 rounded-xl" />
        ))}
        <div className="ml-auto hidden w-64 lg:block">
          <Skeleton className="h-11 rounded-xl" />
        </div>
      </div>

      <CarGridSkeleton count={6} />
    </main>
  )
}
