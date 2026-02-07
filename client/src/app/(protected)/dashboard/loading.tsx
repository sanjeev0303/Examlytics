
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10 pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Main Insights Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-[340px] bg-white/40 dark:bg-zinc-900/40 border border-gray-100 rounded-[32px] p-8">
           <Skeleton className="h-6 w-32 mb-8" />
           <Skeleton className="h-full w-full rounded-xl" />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
            <Skeleton className="h-64 w-full rounded-[32px]" />
            <Skeleton className="h-24 w-full rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}
