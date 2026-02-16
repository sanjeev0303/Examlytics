import { Suspense } from "react";
import { AnalyticsService } from "@/services/analytics.service";
import { DashboardChartsIsland } from "@/components/dashboard/DashboardIslands";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for charts (can be derived or separate fetch)
const accuracyTrendData = [
  { date: "Mon", score: 65, avg: 60 }, { date: "Tue", score: 68, avg: 61 },
  { date: "Wed", score: 75, avg: 63 }, { date: "Thu", score: 72, avg: 64 },
  { date: "Fri", score: 80, avg: 66 }, { date: "Sat", score: 78, avg: 67 },
  { date: "Sun", score: 85, avg: 69 },
];
const focusDecayData = [
  { minute: 5, accuracy: 95, timePerQuestion: 45 },
  { minute: 15, accuracy: 92, timePerQuestion: 50 },
  { minute: 30, accuracy: 85, timePerQuestion: 55 },
  { minute: 45, accuracy: 78, timePerQuestion: 70 },
  { minute: 60, accuracy: 70, timePerQuestion: 90 },
];
const radarData = [
  { topic: "DSA", score: 80, benchmark: 90 }, { topic: "DBMS", score: 65, benchmark: 85 },
  { topic: "CN", score: 70, benchmark: 80 }, { topic: "OS", score: 90, benchmark: 85 },
  { topic: "OOP", score: 85, benchmark: 75 }, { topic: "Sys Design", score: 60, benchmark: 70 },
];

export async function AsyncChartsAndWeakTopics() {
  const weakTopics = await AnalyticsService.getWeakTopics().catch(() => []);

  return (
    <div className="space-y-6">
      <DashboardChartsIsland accuracyData={accuracyTrendData} focusData={focusDecayData} radarData={radarData} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Focus Areas (ROI)</CardTitle>
            <CardDescription>Topics with highest potential impact on your score</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakTopics.length > 0 ? weakTopics.slice(0, 3).map((topic: any, i: number) => (
              <div key={i} className="group p-4 rounded-xl border border-border-subtle hover:border-warning/50 hover:bg-warning/5 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-text-primary">{topic.topicName}</h4>
                  <Badge variant="warning">{topic.accuracy}% Acc</Badge>
                </div>
                <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-warning transition-all" style={{ width: `${topic.accuracy}%` }} />
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-12 text-text-muted">
                <Trophy className="mx-auto h-8 w-8 mb-2 opacity-20" />
                <p>Great job! No critical weak topics detected.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AsyncChartsAndWeakTopicsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Accuracy Chart Skeleton */}
                 <Skeleton className="h-[430px] w-full rounded-xl" />
                 {/* Focus Decay Chart Skeleton */}
                 <Skeleton className="h-[430px] w-full rounded-xl" />
            </div>

            {/* Topic Radar Section Match */}
            <div className="pt-4 space-y-4">
                 <Skeleton className="h-5 w-32" /> {/* Title: Topic Proficiency */}
                 <Skeleton className="h-[430px] w-full rounded-xl" />
            </div>

             {/* Weak topics card skeleton */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-60" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
