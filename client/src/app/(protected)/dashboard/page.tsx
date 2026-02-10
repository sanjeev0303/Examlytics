"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Target,
  Trophy,
  Clock,
  ArrowRight,
  Zap,
  BookOpen,
  TrendingUp,
  Brain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { LearningHealthIndex } from "@/components/dashboard/learning-health-index";
import { InsightCard } from "@/components/dashboard/insight-card";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AccuracyTrendChart } from "@/components/analytics/accuracy-trend-chart";
import { FocusDecayChart } from "@/components/analytics/focus-decay-chart";
import { TopicRadar } from "@/components/analytics/topic-radar";

import { StreakWidget } from "@/components/dashboard/StreakWidget";

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
        return api.getExamHistory({
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    enabled: !!user?.id,
  });

  const { data: streakData } = useQuery({
    queryKey: ["streakData"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.getStreaks({
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    enabled: !!user?.id,
  });


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

  // --- DATA PROCESSING ---
  const exams = history || [];
  const completedExams = exams.filter((e: any) => e.status === "COMPLETED");

  // Calculate LHI (Mock calculation for now)
  const avgAccuracy = completedExams.length
    ? completedExams.reduce((acc: number, e: any) => acc + (e.accuracy || 0), 0) / completedExams.length
    : 0;

  const lhiScore = Math.round(avgAccuracy > 0 ? avgAccuracy : 72);
  const displayWeakTopics = weakTopicsData || [];

  // Mock Data for Charts (Real app would transform `history`)
  const accuracyTrendData = [
      { date: "Mon", score: 65, avg: 60 },
      { date: "Tue", score: 68, avg: 61 },
      { date: "Wed", score: 75, avg: 63 },
      { date: "Thu", score: 72, avg: 64 },
      { date: "Fri", score: 80, avg: 66 },
      { date: "Sat", score: 78, avg: 67 },
      { date: "Sun", score: 85, avg: 69 },
  ];

  const focusDecayData = [
      { minute: 5, accuracy: 95, timePerQuestion: 45 },
      { minute: 15, accuracy: 92, timePerQuestion: 50 },
      { minute: 30, accuracy: 85, timePerQuestion: 55 },
      { minute: 45, accuracy: 78, timePerQuestion: 70 }, // Fatigue sets in
      { minute: 60, accuracy: 70, timePerQuestion: 90 },
  ];

  const radarData = [
      { topic: "DSA", score: 80, benchmark: 90 },
      { topic: "DBMS", score: 65, benchmark: 85 },
      { topic: "CN", score: 70, benchmark: 80 },
      { topic: "OS", score: 90, benchmark: 85 },
      { topic: "OOP", score: 85, benchmark: 75 },
      { topic: "Sys Design", score: 60, benchmark: 70 },
  ];


  // --- COMPONENTS ---

  const HeaderSlot = (
    <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-heading text-text-primary tracking-tight">
                    Dashboard
                </h1>
                <p className="text-text-secondary">
                    Welcome back, {user?.firstName}. Here is your decision center.
                </p>
            </div>
            <div className="hidden md:flex gap-3">
                 <button className="px-4 py-2 text-sm font-medium text-text-primary bg-bg-surface border border-border-subtle rounded-lg hover:bg-bg-surface-raised transition-colors">
                    View Reports
                 </button>
                 <button
                    onClick={() => router.push("/exams/create")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-accent-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                 >
                    Start Practice
                 </button>
            </div>
        </div>
    </div>
  );

  const StatsSlot = (
    <>
        {/* 1. Learning Health Index */}
        <LearningHealthIndex score={lhiScore} trend={2.4} />

        {/* 2. Insight Card */}
        <div className="md:col-span-2">
             <InsightCard
                insight="You tend to rush questions in the first 10 minutes. Slowing down by 15% could improve your score by ~12 points."
                actionLabel="Practice Pacing"
                onAction={() => router.push("/exam?mode=pacing")}
             />

             {/* Replaced Grid with StreakWidget */}
             <StreakWidget streakData={streakData} />
        </div>

        {/* 3. Priority Action */}
        <Card variant="raised" className="bg-linear-to-br from-indigo-900 to-slate-900 text-white border-none relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
             <CardContent className="h-full flex flex-col justify-between p-6 relative z-10">
                <div className="space-y-2">
                    <Badge variant="warning" className="bg-white/10 text-amber-300 border-none">Priority</Badge>
                    <h3 className="text-lg font-semibold leading-tight">Review 'Dynamic Programming' Errors</h3>
                    <p className="text-indigo-200 text-sm">5 pending errors from yesterday.</p>
                </div>
                <button
                    onClick={() => router.push("/exam")}
                    className="mt-4 w-full py-2 bg-white text-indigo-950 font-semibold text-sm rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                    Start Review <ArrowRight className="h-4 w-4" />
                </button>
             </CardContent>
        </Card>
    </>
  );

  const RecentActivitySlot = (
    <Card className="h-full">
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {completedExams.slice(0, 5).map((exam: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0 hover:bg-bg-app/50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-accent-primary" />
                        <div>
                            <p className="font-medium text-sm text-text-primary">{exam.title || "Quick Practice"}</p>
                            <p className="text-xs text-text-secondary">{format(new Date(exam.startedAt), "MMM d, h:mm a")}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="font-mono text-sm font-bold text-text-primary">{Math.round(exam.accuracy)}%</span>
                    </div>
                </div>
            ))}
            {completedExams.length === 0 && (
                <div className="text-center py-8 text-text-muted text-sm">No recent activity.</div>
            )}

            <div className="pt-4 border-t border-border-subtle">
                 <h4 className="text-sm font-medium text-text-secondary mb-4">Topic Proficiency</h4>
                 {isMounted && <TopicRadar data={radarData} className="border-none shadow-none bg-transparent p-0" />}
            </div>
        </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
        header={HeaderSlot}
        stats={StatsSlot}
        recentActivity={RecentActivitySlot}
    >
        {/* Main Content Area: Charts & Weak Topics */}
        <div className="space-y-6">

            {/* Charts Section */}
            {isMounted && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AccuracyTrendChart data={accuracyTrendData} />
                <FocusDecayChart data={focusDecayData} />
            </div>
            )}

            {/* Weak Topics ROI Grid */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Focus Areas (ROI)</CardTitle>
                        <CardDescription>Topics with highest potential impact on your score</CardDescription>
                    </div>
                    <button className="text-sm text-accent-primary hover:underline" onClick={() => router.push("/weak-topics")}>
                        View All
                    </button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {displayWeakTopics.length > 0 ? displayWeakTopics.slice(0, 3).map((topic: any, i: number) => (
                            <div key={i} className="group p-4 rounded-xl border border-border-subtle hover:border-warning/50 hover:bg-warning/5 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-text-primary">{topic.topicName}</h4>
                                    <Badge variant="warning">{topic.accuracy}% Acc</Badge>
                                </div>
                                <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden mb-3">
                                    <div className="h-full bg-warning transition-all" style={{ width: `${topic.accuracy}%` }} />
                                </div>
                                <p className="text-xs text-text-secondary">
                                    Fixing this adds <strong className="text-text-primary">~{100 - topic.accuracy} pts</strong> potential.
                                </p>
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
    </DashboardLayout>
  );
}
