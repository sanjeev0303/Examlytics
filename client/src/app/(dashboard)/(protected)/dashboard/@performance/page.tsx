import { Suspense } from "react";
import { AsyncChartsAndWeakTopics, AsyncChartsAndWeakTopicsSkeleton } from "@/components/dashboard/server/AsyncChartsAndWeakTopics";

export default function PerformanceSlot() {
  return (
    <Suspense fallback={<AsyncChartsAndWeakTopicsSkeleton />}>
      <AsyncChartsAndWeakTopics />
    </Suspense>
  );
}
