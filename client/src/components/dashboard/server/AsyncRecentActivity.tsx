import { Suspense } from "react";
import { ExamService } from "@/services/exam.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ExamHistoryItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export async function AsyncRecentActivity() {
  const history = await ExamService.getHistory().catch(() => []);
  const completedExams = (history || []).filter((e: ExamHistoryItem) => e.status === "COMPLETED");

  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {completedExams.slice(0, 5).map((exam: ExamHistoryItem, i: number) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0 hover:bg-bg-app/50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent-primary" />
              <div>
                <p className="font-medium text-sm text-text-primary">{exam.title || exam.topicName || "Quick Practice"}</p>
                <p className="text-xs text-text-secondary">{format(new Date(exam.startedAt), "MMM d, h:mm a")}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-text-primary">{Math.round(exam.accuracy || 0)}%</span>
            </div>
          </div>
        ))}
        {/* Radar moved to ChartsIsland for SSR safety */}
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
      <Card className="h-full">
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800 last:border-0">
                      <div className="flex items-center gap-3 w-full">
                          <Skeleton className="h-2 w-2 rounded-full" />
                          <div className="space-y-2 w-full">
                              <Skeleton className="h-3 w-3/4" />
                              <Skeleton className="h-2 w-1/2" />
                          </div>
                      </div>
                      <Skeleton className="h-4 w-8" />
                  </div>
              ))}
          </CardContent>
      </Card>
  )
}
