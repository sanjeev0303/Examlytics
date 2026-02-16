import { Suspense } from "react";
import { AnalyticsService } from "@/services/analytics.service";
import { StreakWidget } from "@/components/dashboard/StreakWidget";
import { Skeleton } from "@/components/ui/skeleton";

export async function AsyncStreakWidget() {
  const streakData = await AnalyticsService.getStreaks().catch(() => undefined);

  return <StreakWidget streakData={streakData} />;
}

export function StreakWidgetSkeleton() {
  return <Skeleton className="h-[120px] w-full" />;
}
