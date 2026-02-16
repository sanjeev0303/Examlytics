import { Suspense } from "react";
import { currentUser } from "@/server/auth";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityActionIsland } from "@/components/dashboard/DashboardIslands";
import { InsightCard } from "@/components/cards/insight-card"; // Static import for LCP

// Async Server Components
import { AsyncLearningHealthIndex, LearningHealthIndexSkeleton } from "@/components/dashboard/server/AsyncLearningHealthIndex";
import { AsyncStreakWidget, StreakWidgetSkeleton } from "@/components/dashboard/server/AsyncStreakWidget";
import { AsyncChartsAndWeakTopics, AsyncChartsAndWeakTopicsSkeleton } from "@/components/dashboard/server/AsyncChartsAndWeakTopics";
import { AsyncRecentActivity, RecentActivitySkeleton } from "@/components/dashboard/server/AsyncRecentActivity";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <DashboardLayout
      header={
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading text-text-primary tracking-tight">Dashboard</h1>
              <p className="text-text-secondary">Welcome back, {user?.firstName}. Here is your decision center.</p>
            </div>
          </div>
        </div>
      }
      stats={
        <>
          <Suspense fallback={<LearningHealthIndexSkeleton />}>
            <AsyncLearningHealthIndex />
          </Suspense>
          <div className="md:col-span-2">
            {/* InsightCard is static/client but doesn't fetch data, so render immediately for LCP */}
            <InsightCard
                insight="You tend to rush questions in the first 10 minutes. Slowing down by 15% could improve your score by ~12 points."
                actionLabel="Practice Pacing"
                className="h-[140px]"
            />
            <Suspense fallback={<StreakWidgetSkeleton />}>
              <AsyncStreakWidget />
            </Suspense>
          </div>
          <PriorityActionIsland />
        </>
      }
      recentActivity={
        <Suspense fallback={<RecentActivitySkeleton />}>
          <AsyncRecentActivity />
        </Suspense>
      }
    >
      <Suspense fallback={<AsyncChartsAndWeakTopicsSkeleton />}>
        <AsyncChartsAndWeakTopics />
      </Suspense>
    </DashboardLayout>
  );
}
