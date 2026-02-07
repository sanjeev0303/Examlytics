"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  BarChart2,
  Target,
  Trophy,
  Clock
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Label,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: history } = useQuery({
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

  // Calculate Aggregated Stats
  const exams = history || [];
  const completedExams = exams.filter((e: any) => e.status === "COMPLETED");

  const totalQuestions = completedExams.reduce((acc: number, e: any) => acc + (e.totalQuestions || 0), 0);
  const avgAccuracy = completedExams.length
    ? completedExams.reduce((acc: number, e: any) => acc + (e.accuracy || 0), 0) / completedExams.length
    : 0;

  const avgTimePerQ = completedExams.length && totalQuestions
    ? completedExams.reduce((acc: number, e: any) => acc + (e.timeTaken || 0), 0) / totalQuestions
    : 0;

  const { data: weakTopicsData } = useQuery({
    queryKey: ["weakTopics"],
    queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        return api.getWeakTopics({
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    enabled: !!user?.id,
  });

  const displayWeakTopics = weakTopicsData || [];

  // --- SLOTS ---

  const HeaderSlot = (
    <div className="relative w-full overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 to-indigo-950 p-8 text-white shadow-2xl dark:from-indigo-950 dark:to-black">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl opacity-50" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-100 ring-1 ring-inset ring-indigo-500/30">
                Early Access
              </span>
              <span className="text-xs text-indigo-200">v1.2.0</span>
            </div>

            <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Hello, {user?.firstName || 'Scholar'}
            </h1>

            <div className="space-y-1">
              <p className="text-lg font-medium text-indigo-100">
                Your Learning Health is <span className="text-emerald-400">Excellent</span>
              </p>
              <p className="text-sm leading-relaxed text-indigo-200/80">
                "Your accuracy improved by <strong className="text-white">12%</strong> this week. Arrays and Linked Lists are your strongest assets, but <strong className="text-amber-300">Dynamic Programming</strong> needs attention for your upcoming interview."
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-3">
             <button
                 onClick={() => router.push("/exam")}
                 className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-950 shadow-lg shadow-black/10 transition-all hover:bg-indigo-50 hover:shadow-xl active:scale-95"
             >
                 <Target className="h-4 w-4" />
                 Practice Weak Topics
             </button>
          </div>
        </div>
      </div>
  );

  const StatsSlot = (
    <>
        <StatCard
          label="Knowledge Index"
          value={`${Math.round(avgAccuracy)}%`}
          icon={Trophy}
          trend={{ value: 4.5, isPositive: true }}
          subtext="Top 15% of peers"
        />
        <StatCard
          label="Total Questions"
          value={totalQuestions.toLocaleString()}
          icon={Target}
          subtext="+24 this week"
        />
        <StatCard
          label="Focus Score"
          value="8.4"
          icon={BarChart2}
          subtext="High consistency"
        />
        <StatCard
          label="Avg Time / Question"
          value={`${Math.round(avgTimePerQ)}s`}
          icon={Clock}
          trend={{ value: 1.2, isPositive: true }}
          subtext="Improved speed"
        />
    </>
  );

  const ActivitySlot = (
      <>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="font-heading text-lg font-semibold text-foreground">Focus Areas</h3>
                <p className="text-sm text-muted-foreground">Topics requiring attention</p>
            </div>

            <div className="space-y-4">
                {displayWeakTopics.length > 0 ? displayWeakTopics.slice(0, 4).map((topic: any, i: number) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border border-border bg-accent/20 p-4 transition-all hover:border-primary/20 hover:bg-accent/40">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-foreground lowercase first-letter:capitalize">{topic.topicName}</span>
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                            {topic.accuracy}% Acc
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div
                            className="h-full rounded-full bg-rose-500 transition-all duration-500"
                            style={{ width: `${topic.accuracy}%` }}
                        />
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        Recommended: Practice 15 {topic.topicName} questions.
                    </p>
                </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <Trophy className="mb-2 h-8 w-8 opacity-20" />
                        <p className="text-sm">No weak topics detected.</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => router.push("/history")}
                className="mt-6 w-full rounded-lg border border-border bg-transparent py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
                View Full Analysis
            </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-900 to-emerald-950 p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />
            <h4 className="relative z-10 text-lg font-bold">Daily Streak 🔥</h4>
            <p className="relative z-10 mt-1 text-sm text-emerald-100">You're on a 3-day streak! Complete one more exam to unlock the "Consistent Learner" badge.</p>
        </div>
      </>
  );

  return (
    <DashboardLayout
        header={HeaderSlot}
        stats={StatsSlot}
        recentActivity={ActivitySlot}
    >
        {/* Main Charts Content */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
             <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">Skill Profile</h3>
                    <p className="text-sm text-muted-foreground">Detailed breakdown of your topic proficiency</p>
                </div>
            </div>

            <div className="flex h-[350px] w-full items-center justify-center">
                    {isMounted && (
                    <ChartContainer
                        config={{
                        score: { label: "Score", color: "hsl(var(--chart-1))" },
                        }}
                        className="aspect-square h-full max-h-[350px] w-full"
                    >
                        <RadarChart data={displayWeakTopics.length ? displayWeakTopics : [{topicName: "No Data", accuracy: 0}]}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarAngleAxis dataKey="topicName" tick={{ fill: "var(--foreground)", fontSize: 12, opacity: 0.7 }} />
                        <PolarGrid stroke="var(--border)" />
                        <Radar
                            name="Accuracy"
                            dataKey="accuracy"
                            stroke="var(--primary)"
                            fill="var(--primary)"
                            fillOpacity={0.2}
                            dot={{
                            r: 3,
                            fill: "var(--background)",
                            stroke: "var(--primary)",
                            strokeWidth: 2,
                            }}
                        />
                        </RadarChart>
                    </ChartContainer>
                    )}
            </div>
        </div>

        {/* Recent History List (Mini) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="font-heading text-lg font-semibold text-foreground">Recent Sessions</h3>
            </div>
            <div className="space-y-1">
                {completedExams.slice(0, 3).map((exam: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent/50">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <BarChart2 size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{exam.title || "Quick Practice"}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(exam.startedAt), "PPP p")}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-foreground">{Math.round(exam.accuracy)}%</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">Excellent</p>
                        </div>
                    </div>
                ))}
                {completedExams.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">No recent exams found.</p>
                )}
            </div>
        </div>
    </DashboardLayout>
  );
}
