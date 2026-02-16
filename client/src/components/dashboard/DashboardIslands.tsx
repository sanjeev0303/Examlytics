"use client";

import dynamic from "next/dynamic";
import { Skeleton, ChartSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const AccuracyTrendChart = dynamic(() => import("@/components/charts/accuracy-trend-chart").then(mod => mod.AccuracyTrendChart), {
    ssr: false,
    loading: () => <ChartSkeleton />
});

const FocusDecayChart = dynamic(() => import("@/components/charts/focus-decay-chart").then(mod => mod.FocusDecayChart), {
    ssr: false,
    loading: () => <ChartSkeleton />
});

const TopicRadar = dynamic(() => import("@/components/charts/topic-radar").then(mod => mod.TopicRadar), {
    ssr: false,
    loading: () => <ChartSkeleton />
});

export const DashboardChartsIsland = ({ accuracyData, focusData, radarData }: { accuracyData: any, focusData: any, radarData: any }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AccuracyTrendChart data={accuracyData} />
                <FocusDecayChart data={focusData} />
            </div>
            <div className="pt-4 border-t border-border-subtle">
              <h4 className="text-sm font-medium text-text-secondary mb-4">Topic Proficiency</h4>
              <TopicRadar data={radarData} className="border-none shadow-none bg-transparent p-0" />
            </div>
        </div>
    );
};

export const PriorityActionIsland = () => {
    const router = useRouter();
    return (
        <Card variant="raised" className="bg-linear-to-br from-indigo-900 to-slate-900 text-white border-none relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
             <CardContent className="h-full flex flex-col justify-between p-6 relative z-10">
                <div className="space-y-2">
                    <Badge variant="warning" className="bg-white/10 text-amber-300 border-none">Priority</Badge>
                    <h3 className="text-lg font-semibold leading-tight">Review &apos;Dynamic Programming&apos; Errors</h3>
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
    );
};
