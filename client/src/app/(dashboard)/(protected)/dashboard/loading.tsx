
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>

      {/* Stats Grid Skeleton */}
      {/* Learning Health Index & Insight Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-[230px] w-full rounded-[32px]" />
          <div className="md:col-span-2 flex flex-col gap-4">
              <Skeleton className="h-[140px] w-full rounded-[32px]" />
              <Skeleton className="h-[100px] w-full rounded-[32px]" />
          </div>
          <Skeleton className="h-[250px] w-full rounded-[32px]" />
      </div>

      {/* Main Insights Skeleton */}
      {/* Charts & Recent Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Skeleton className="h-[430px] w-full rounded-[32px]" />
                 <Skeleton className="h-[430px] w-full rounded-[32px]" />
            </div>
            <Skeleton className="h-[200px] w-full rounded-[32px]" />
        </div>

        <div className="space-y-8">
            <Skeleton className="h-[500px] w-full rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}
