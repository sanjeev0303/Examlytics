import { Suspense } from "react";
import { AsyncRecentActivity, RecentActivitySkeleton } from "@/components/dashboard/server/AsyncRecentActivity";
import { AsyncStreakWidget, StreakWidgetSkeleton } from "@/components/dashboard/server/AsyncStreakWidget";

export default function RecentExamsSlot() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<StreakWidgetSkeleton />}>
        <AsyncStreakWidget />
      </Suspense>
      <Suspense fallback={<RecentActivitySkeleton />}>
        <AsyncRecentActivity />
      </Suspense>
    </div>
  );
}
