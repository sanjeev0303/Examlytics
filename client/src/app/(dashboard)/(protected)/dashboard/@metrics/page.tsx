import { Suspense } from "react";
import { AsyncLearningHealthIndex, LearningHealthIndexSkeleton } from "@/components/dashboard/server/AsyncLearningHealthIndex";
import { AsyncSystemHealth } from "@/components/dashboard/server/AsyncSystemHealth";
import { PriorityActionIsland } from "@/components/dashboard/DashboardIslands";

export default function MetricsSlot() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Suspense fallback={<LearningHealthIndexSkeleton />}>
        <AsyncLearningHealthIndex />
      </Suspense>
      <AsyncSystemHealth />
      <PriorityActionIsland />
    </div>
  );
}
