"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks"; // Custom hook
import { AlertTriangle, TrendingUp, CheckCircle2, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function WeakTopicsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: weakTopics, isLoading } = useQuery({
    queryKey: ["weakTopics"],
    queryFn: async () => {
        // Api client handles auth cookies automatically
        return api.getWeakTopics();
    },
    enabled: !!user?.id,
  });

  if (!isAuthenticated || (!isLoading && !user?.id)) return <div className="flex h-screen items-center justify-center text-text-secondary">Please sign in to view weak topics.</div>;

  if (isLoading) {
      return (
          <div className="space-y-8 animate-fade-in-up">
              <div>
                  <h1 className="text-3xl font-bold font-heading text-text-primary">Weak Topics</h1>
                  <p className="text-text-secondary mt-2">AI-driven insights to help you improve faster.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                      <CardSkeleton key={i} />
                  ))}
              </div>
          </div>
      )
  }

  // --- DATA PROCESSING ---
  // Calculates ROI: (100 - Accuracy) * Weight
  // Weight could be based on importance, but for now we assume all topics equal.

  interface WeakTopic {
    topicName: string;
    accuracy: number;
    severity?: "critical" | "warning" | "success";
    roi?: number;
    examType?: string;
  }

  const processedTopics = (weakTopics || []).map((t: WeakTopic) => ({
      ...t,
      roi: Math.round(100 - t.accuracy),
      severity: t.accuracy < 50 ? "critical" : t.accuracy < 80 ? "warning" : "success"
  })).sort((a: WeakTopic, b: WeakTopic) => (b.roi || 0) - (a.roi || 0)); // High ROI first

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-heading text-text-primary">Targeted Improvement</h1>
            <p className="text-text-secondary mt-2 max-w-2xl">
                Focusing on these high-ROI topics is the fastest way to improve your overall score.
            </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-full">
            <Zap className="h-4 w-4 text-warning" />
            <span>Sorted by Potential Score Boost</span>
        </div>
      </div>

      {/* Topics Grid */}
      {processedTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedTopics.map((topic: WeakTopic, i: number) => {
                const isCritical = topic.severity === "critical";
                const isWarning = topic.severity === "warning";

                return (
                    <Card
                        key={`${topic.topicName}-${i}`}
                        variant={isCritical ? "raised" : "default"}
                        className={`group cursor-pointer hover:border-accent-primary/20 transition-all duration-300 ${isCritical ? 'border-l-4 border-l-critical dark:border-l-critical' : ''}`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={isCritical ? "destructive" : isWarning ? "warning" : "success"}>
                                    {topic.accuracy}% Accuracy
                                </Badge>
                                {isCritical && <AlertTriangle className="h-4 w-4 text-critical" />}
                            </div>
                            <CardTitle className="text-lg leading-tight line-clamp-2 min-h-12">
                                {topic.topicName}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="pb-3">
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>Proficiency</span>
                                    <span>{topic.accuracy}/100</span>
                                </div>
                                <div className="h-2 w-full bg-accent-secondary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${isCritical ? 'bg-critical' : isWarning ? 'bg-warning' : 'bg-success'}`}
                                        style={{ width: `${topic.accuracy}%` }}
                                    />
                                </div>
                                <div className="p-2.5 bg-accent-secondary/50 rounded-lg">
                                    <p className="text-xs font-medium text-text-secondary flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3" />
                                        Potential Boost: <span className="text-text-primary font-bold">+{topic.roi} pts</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button
                                className="w-full text-xs"
                                variant={isCritical ? "destructive" : "secondary"}
                                onClick={() => router.push(`/exam?type=${topic.examType}&topic=${encodeURIComponent(topic.topicName)}`)}
                            >
                                Start Repair Session
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border-subtle rounded-2xl bg-bg-surface/50">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">All Systems Go!</h3>
            <p className="text-text-secondary mt-2">
                No weak topics detected. You are performing above threshold in all tracked areas.
            </p>
            <Button className="mt-6" onClick={() => router.push("/exam")}>
                Start Comprehensive Review
            </Button>
        </div>
      )}
    </div>
  );
}
