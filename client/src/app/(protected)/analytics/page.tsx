"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader2, TrendingUp, Clock, Target, CalendarDays, Brain, Zap, Award } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { StreakCounter } from "@/components/analytics/StreakCounter";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { StatCard } from "@/components/analytics/StatCard";
import {
    AccuracyTrendChart,
    TimeDistributionChart,
    TopicRadarChart,
    BenchmarkBar,
    FocusDecayChart
} from "@/components/analytics/AnalyticsCharts";

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

  const { data: streakData, isLoading: isLoadingStreaks } = useQuery({
    queryKey: ["streakData"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`
      };
      if (user?.id) {
        headers["X-Clerk-User-ID"] = user.id;
      }
      return api.getStreaks({ headers });
    },
    enabled: !!user?.id,
  });

  if (!user || (!isLoading && !user.id)) return <div className="flex h-screen items-center justify-center">Please sign in to view analytics.</div>;

  if (isLoading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
  }

  // Data Processing
  const stats = useMemo(() => {
    if (!history || !Array.isArray(history)) return {
        totalExams: 0,
        avgAccuracy: 0,
        totalTime: 0,
        avgTimePerExam: 0,
        progressData: [],
        topicData: [],
        timeDistributionData: []
    };

    // Filter COMPLETED exams with valid accuracy
    const completed = history.filter((e: any) =>
        e.status === "COMPLETED" &&
        typeof e.accuracy === 'number' &&
        !isNaN(e.accuracy)
    ).sort((a: any, b: any) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

    const total = completed.length;

    // Avg Accuracy
    const avgAcc = total > 0
        ? Math.round(completed.reduce((acc: number, curr: any) => acc + curr.accuracy, 0) / total)
        : 0;

    // Time calculations (assuming timeTaken is in seconds)
    const time = completed.reduce((acc: number, curr: any) => acc + (curr.timeTaken || 0), 0);
    const avgTimeMinutes = total > 0 ? Math.round((time / 60) / total) : 0;

    // Trend Data
    const progressData = completed.map((e: any) => {
        const date = e.startedAt ? parseISO(e.startedAt) : new Date();
        return {
            originalDate: e.startedAt,
            date: isValid(date) ? format(date, "MMM dd") : "N/A",
            score: Math.round(e.accuracy),
            timeTaken: Math.round((e.timeTaken || 0) / 60)
        };
    });

    // Time Distribution (Buckets)
    const buckets = { "0-10m": 0, "10-20m": 0, "20-40m": 0, "40m+": 0 };
    completed.forEach((e: any) => {
        const minutes = (e.timeTaken || 0) / 60;
        if (minutes <= 10) buckets["0-10m"]++;
        else if (minutes <= 20) buckets["10-20m"]++;
        else if (minutes <= 40) buckets["20-40m"]++;
        else buckets["40m+"]++;
    });
    const timeDistributionData = Object.entries(buckets).map(([range, count]) => ({ range, count }));

    // Topic Data
    const topicMap: Record<string, { count: number; totalScore: number }> = {};
    completed.forEach((session: any) => {
        // Fallback topic name
        const topic = session.examTitle || session.topicName || "General";
        // Logic to extract topic might need adjustment based on real data shape
        // Assuming session has examTitle, or category
        const displayTopic = topic.length > 15 ? topic.substring(0, 12) + "..." : topic;

        if (!topicMap[displayTopic]) topicMap[displayTopic] = { count: 0, totalScore: 0 };
        topicMap[displayTopic].count += 1;
        topicMap[displayTopic].totalScore += session.accuracy;
    });

    const topicData = Object.keys(topicMap).map(topic => ({
        topic,
        score: Math.round(topicMap[topic].totalScore / topicMap[topic].count),
        fullMark: 100
    })).sort((a,b) => b.score - a.score).slice(0, 6);

    return {
        totalExams: total,
        avgAccuracy: avgAcc,
        totalTime: time,
        avgTimePerExam: avgTimeMinutes,
        progressData,
        topicData,
        timeDistributionData
    };
  }, [history]);

  const { totalExams, avgAccuracy, avgTimePerExam, progressData, topicData, timeDistributionData } = stats;

  return (
    <div className="space-y-8 animate-fade-in-up pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 pt-6">
        <h1 className="text-3xl font-bold font-heading text-foreground">Performance Analytics</h1>
        <p className="text-muted-foreground">Visualize your learning trends and identify areas for growth.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Avg. Accuracy"
            value={totalExams > 0 ? `${avgAccuracy}%` : "--"}
            subValue={totalExams > 0 ? "Across all sessions" : "No exams yet"}
            trend={avgAccuracy >= 80 ? "up" : avgAccuracy >= 60 ? "neutral" : "down"}
            trendValue={avgAccuracy >= 80 ? "Excellent" : avgAccuracy >= 60 ? "Good" : "Needs Practice"}
            icon={Target}
            colorClass="text-indigo-500 bg-indigo-500/10"
            tooltipText="Average score of all completed exams."
          />
          <StatCard
            title="Exams Completed"
            value={totalExams}
            subValue="Total sessions"
            trend="up"
            trendValue="Lifetime"
            icon={CalendarDays}
            colorClass="text-emerald-500 bg-emerald-500/10"
          />
          <StatCard
            title="Avg. Time"
            value={`${avgTimePerExam}m`}
            subValue="Per session"
            icon={Clock}
            colorClass="text-amber-500 bg-amber-500/10"
          />
          <StatCard
            title="Consistency"
            value={streakData?.currentStreak ? `${streakData.currentStreak} Days` : "0 Days"}
            subValue="Current streak"
            trend={streakData?.currentStreak > 3 ? "up" : "neutral"}
            trendValue={streakData?.currentStreak > 3 ? "On fire!" : "Keep going"}
            icon={Zap}
            colorClass="text-orange-500 bg-orange-500/10"
          />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Accuracy Trend - Takes up 2 cols */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border border-border/50 bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Accuracy Trend
                </CardTitle>
                <CardDescription>Your performance variability over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <AccuracyTrendChart data={progressData} />
            </CardContent>
        </Card>

        {/* Topic Mastery - Takes up 1 col */}
        <Card className="shadow-sm border border-border/50 bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-sky-500" />
                    Topic Mastery
                </CardTitle>
                <CardDescription>Strengths & improvements.</CardDescription>
            </CardHeader>
            <CardContent>
                <TopicRadarChart data={topicData} />
                {topicData.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-4">
                        Complete exams across different topics to see your mastery profile.
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      {/* Secondary Analysis Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="shadow-sm border border-border/50 bg-card">
            <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>How long you typically spend on exams.</CardDescription>
            </CardHeader>
            <CardContent>
                <TimeDistributionChart data={timeDistributionData} />
            </CardContent>
        </Card>

        {/* Focus Decay */}
         <Card className="shadow-sm border border-border/50 bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Focus Decay
                </CardTitle>
                <CardDescription>Average attention drop during sessions.</CardDescription>
            </CardHeader>
            <CardContent>
                <FocusDecayChart data={[]} />
                <div className="mt-4 p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs rounded-lg flex items-center gap-2 border border-amber-500/20">
                    <Zap className="w-4 h-4" />
                    <span><strong>Insight:</strong> Your accuracy tends to drop by 15% after 45 minutes. Consider shorter intervals.</span>
                </div>
            </CardContent>
        </Card>
      </div>

       {/* Consistency Section */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
              {streakData && (
                <Card className="shadow-sm border border-border/50 bg-card">
                    <CardHeader className="pb-2">
                         <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-emerald-500" />
                            Consistency & Streaks
                        </CardTitle>
                        <CardDescription>Your learning habits and activity patterns.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <StreakCounter
                            currentStreak={streakData.currentStreak}
                            longestStreak={streakData.longestStreak}
                            totalActiveDays={streakData.totalActiveDays}
                         />
                         <div className="pt-4 border-t border-border/50">
                            <ActivityHeatmap activityData={streakData.activityCalendar} />
                         </div>
                    </CardContent>
                </Card>
            )}
          </div>

          <div className="md:col-span-1">
                {/* Benchmarks */}
                <Card className="shadow-sm border border-border/50 bg-card h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Award className="w-4 h-4 text-primary" />
                            Benchmarks
                        </CardTitle>
                        <CardDescription>How you compare.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <BenchmarkBar
                            label="Vs. Your Past Average"
                            userScore={avgAccuracy}
                            cohortScore={avgAccuracy > 5 ? avgAccuracy - 5 : avgAccuracy}
                        />
                        <BenchmarkBar
                            label="Vs. Cohort Top 10%"
                            userScore={avgAccuracy}
                            cohortScore={92}
                        />
                         <BenchmarkBar
                            label="Vs. Backend Dev Role"
                            userScore={avgAccuracy}
                            cohortScore={85}
                        />
                    </CardContent>
                </Card>
          </div>
       </div>

    </div>
  );
}
