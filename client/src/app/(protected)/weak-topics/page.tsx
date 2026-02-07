"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Target, ArrowRight, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function WeakTopicsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();

  const { data: weakTopics, isLoading } = useQuery({
    queryKey: ["weakTopics"],
    queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`
        };
        if (user?.id) {
            headers["X-Clerk-User-ID"] = user.id;
        }
        return api.getWeakTopics({ headers });
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  if (!user || (!isLoading && !user.id)) return <div className="flex h-screen items-center justify-center">Please sign in to view weak topics.</div>;

  if (isLoading) {
      return (
          <div className="space-y-8 animate-fade-in-up">
              <div>
                  <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Weak Topics</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">AI-driven insights to help you improve faster.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                      <CardSkeleton key={i} />
                  ))}
              </div>
          </div>
      )
  }

  // Processing & Grouping by Severity
  const criticalTopics: any[] = [];
  const improvementTopics: any[] = [];
  const masteredTopics: any[] = [];

  if (weakTopics && Array.isArray(weakTopics)) {
    weakTopics.forEach((wt: any) => {
        const accuracy = Math.round(wt.accuracy);
        const item = { ...wt, accuracy };

        if (accuracy < 50) {
            criticalTopics.push(item);
        } else if (accuracy < 80) {
            improvementTopics.push(item);
        } else {
            masteredTopics.push(item);
        }
    });
  }

  // Sorting: Lowest accuracy first
  criticalTopics.sort((a, b) => a.accuracy - b.accuracy);
  improvementTopics.sort((a, b) => a.accuracy - b.accuracy);

  const Section = ({ title, topics, icon: Icon, colorClass, emptyMsg }: any) => (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${colorClass}`} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <Badge variant="secondary" className="ml-2">{topics.length}</Badge>
        </div>

        {topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic: any) => (
                <Card key={`${topic.topicName}-${topic.examType}`} className="hover:shadow-lg transition-all border-l-4 group" style={{ borderLeftColor: colorClass.includes('red') ? '#ef4444' : colorClass.includes('yellow') ? '#eab308' : '#22c55e' }}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider mb-1">
                            {topic.examType}
                        </Badge>
                        <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
                            {topic.topicName}
                        </CardTitle>
                    </div>
                    {/* Radial Progress Mini */}
                    <div className="relative flex items-center justify-center p-2">
                        <span className={`text-sm font-bold ${colorClass}`}>{topic.accuracy}%</span>
                    </div>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-2 mb-4">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${colorClass.replace('text-', 'bg-')}`}
                                style={{ width: `${Math.min(topic.accuracy, 100)}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                            <span>{topic.attempts} Attempt{topic.attempts !== 1 ? 's' : ''}</span>
                            <span>{topic.status && topic.status !== 'Unknown' ? topic.status : 'Analysis Pending'}</span>
                        </div>

                        <Button
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push(`/exam?type=${topic.examType}&topic=${encodeURIComponent(topic.topicName)}`)}
                        >
                            Practice Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
                ))}
            </div>
        ) : (
            <div className="p-8 text-center bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-dashed text-gray-500 text-sm">
                {emptyMsg}
            </div>
        )}
      </div>
  );

  return (
    <div className="space-y-12 animate-fade-in-up pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-rose-50 to-indigo-50 dark:from-rose-950/20 dark:to-indigo-950/20 p-8 md:p-12 mb-8">
        <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4">
                Targeted Improvement
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Our AI analyzes your performance to identify exactly where you can gain the most marks. Focusing on Critical topics yields the highest ROI.
            </p>
        </div>
        <Target className="absolute right-0 top-0 h-64 w-64 -mr-12 -mt-12 text-rose-500/10 rotate-12" />
      </div>

      <Section
        title="Critical Attention Needed"
        topics={criticalTopics}
        icon={AlertTriangle}
        colorClass="text-red-600"
        emptyMsg="Great job! You have no critical weak topics. Keep maintaining your streak!"
      />

      <Section
        title="Needs Improvement"
        topics={improvementTopics}
        icon={TrendingUp}
        colorClass="text-yellow-600"
        emptyMsg="No topics in this range. You're either mastering everything or just getting started."
      />

      {masteredTopics.length > 0 && (
          <Section
            title="Mastered Topics"
            topics={masteredTopics}
            icon={CheckCircle2}
            colorClass="text-emerald-600"
            emptyMsg=""
          />
      )}
    </div>
  );
}
