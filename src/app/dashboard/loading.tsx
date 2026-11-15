import { SkeletonStat, SkeletonTable } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-12">
      <div className="space-y-4">
        <div className="skeleton-block h-3 w-28 rounded-full" />
        <div className="skeleton-block h-10 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
      <SkeletonTable rows={6} columns={5} />
    </div>
  )
}
