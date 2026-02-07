"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader2, TrendingUp, Clock, Target, CalendarDays } from "lucide-react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartErrorBoundary } from "@/components/ui/ChartErrorBoundary";

import { ChartFactory } from "@/components/analytics/ChartFactory";

// const AccuracyTrendChart = dynamic(...); // Replaced by Factory
// const TimeDistributionChart = dynamic(...); // Replaced by Factory

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const { data: history, isLoading } = useQuery({
    queryKey: ["examHistory"],
    queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`
        };
        if (user?.id) {
            headers["X-Clerk-User-ID"] = user.id;
        }
        return api.getExamHistory({ headers });
    },
    enabled: !!user?.id,
  });

  if (!user || (!isLoading && !user.id)) return <div className="flex h-screen items-center justify-center">Please sign in to view analytics.</div>;

  if (isLoading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
  }

  // Data Processing
  // Metrics - Memoized for performance
  const stats = useMemo(() => {
    if (!history) return { totalExams: 0, avgAccuracy: 0, totalTime: 0, avgTimePerExam: 0, progressData: [] };

    const completed = history.filter((e: any) => e.status === "COMPLETED")
        .sort((a: any, b: any) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

    const total = completed.length;
    const avgAcc = total > 0
        ? Math.round(completed.reduce((acc: number, curr: any) => acc + (curr.accuracy || 0), 0) / total)
        : 0;
    const time = completed.reduce((acc: number, curr: any) => acc + (curr.timeTaken || 0), 0);
    const avgTime = total > 0 ? Math.round((time / 60) / total) : 0;

    const progData = completed.map((e: any) => ({
        date: e.startedAt ? format(new Date(e.startedAt), "dd/MM") : "N/A",
        score: isNaN(e.accuracy) ? 0 : Math.round(e.accuracy),
        timeTaken: isNaN(e.timeTaken) ? 0 : Math.round((e.timeTaken || 0) / 60)
    }));

    return { totalExams: total, avgAccuracy: avgAcc, totalTime: time, avgTimePerExam: avgTime, progressData: progData };
  }, [history]);

  const { totalExams, avgAccuracy, avgTimePerExam, progressData } = stats;

  const chartConfig = {
      score: {
          label: "Accuracy",
          color: "hsl(var(--chart-1))",
      },
      timeTaken: {
          label: "Time (min)",
          color: "hsl(var(--chart-2))",
      }
  };

  const StatCard = ({ title, value, sub, icon: Icon, colorClass }: any) => (
      <Card>
          <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${colorClass.replace("bg-", "text-")}`} />
              </div>
              <div>
                  <p className="text-sm font-medium text-muted-foreground">{title}</p>
                  <h3 className="text-2xl font-bold">{value}</h3>
                  {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
              </div>
          </CardContent>
      </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Performance Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Visualize your learning trends and identifying areas for growth.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Avg. Accuracy"
            value={`${avgAccuracy}%`}
            sub="Across all exams"
            icon={Target}
            colorClass="bg-indigo-500 text-indigo-500"
          />
          <StatCard
            title="Exams Completed"
            value={totalExams}
            sub="Total sessions"
            icon={CalendarDays}
            colorClass="bg-emerald-500 text-emerald-500"
          />
          <StatCard
            title="Avg. Time"
            value={`${avgTimePerExam}m`}
            sub="Per session"
            icon={Clock}
            colorClass="bg-amber-500 text-amber-500"
          />
          <StatCard
            title="Consistency"
            value="Good"
            sub="Last 7 days"
            icon={TrendingUp}
            colorClass="bg-rose-500 text-rose-500"
          />
      </div>

      {/* Charts (Using Strategy Pattern via ChartFactory) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1 shadow-sm border-border/50">
            <CardHeader className="pb-2">
                <CardTitle>Accuracy Trend</CardTitle>
                <CardDescription>Your performance variability over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full pt-4">
                <ChartErrorBoundary>
                  <ChartFactory
                    type="area"
                    data={progressData}
                    xKey="date"
                    dataKey="score"
                    color="hsl(var(--chart-1))"
                  />
                </ChartErrorBoundary>
            </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border/50">
            <CardHeader className="pb-2">
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>Minutes spent per exam session.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full pt-4">
                <ChartErrorBoundary>
                  <ChartFactory
                    type="bar"
                    data={progressData}
                    xKey="date"
                    dataKey="timeTaken"
                    color="hsl(var(--chart-2))"
                  />
                </ChartErrorBoundary>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
