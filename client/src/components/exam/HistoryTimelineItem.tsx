"use client";

import { memo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { ExamHistoryItem } from "@/types";

interface HistoryTimelineItemProps {
  session: ExamHistoryItem;
  isLast?: boolean;
}

export const HistoryTimelineItem = memo(({ session, isLast }: HistoryTimelineItemProps) => {
  const router = useRouter();
  const isCompleted = session.status === 'COMPLETED';
  const accuracy = session.totalQuestions > 0 ? Math.round((session.score / session.totalQuestions) * 100) : 0;
  const passed = accuracy >= 70;

  // Mock Quality Score for visual demonstration (since backend might not have it yet)
  const quality = Math.min(100, Math.round(accuracy * 0.8 + (isCompleted ? 20 : 0)));

  // Mock Trend for visual demo
  const trend = accuracy > 75 ? "up" : accuracy < 50 ? "down" : "stable";

  return (
    <div className="relative pl-8 pb-8">
        {/* Timeline Line */}
        {!isLast && (
             <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border/50" />
        )}

        {/* Timeline Dot */}
        <div className={cn(
            "absolute left-0 top-6 h-6 w-6 rounded-full border-4 border-background flex items-center justify-center z-10",
            isCompleted
                ? (passed ? "bg-emerald-500" : "bg-amber-500")
                : "bg-slate-300 dark:bg-slate-600"
        )}>
            {isCompleted ? (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
            ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 dark:bg-slate-300" />
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-card hover:bg-accent/5 p-4 rounded-xl border border-border/40 shadow-sm transition-all group">

            {/* Time & Title */}
            <div className="flex-1 min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                        {format(new Date(session.startedAt), "h:mm a")}
                    </span>
                    <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 h-5 font-normal border-0",
                        isCompleted ? (passed ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600") : "bg-slate-500/10 text-slate-600"
                    )}>
                        {isCompleted ? (passed ? "Passed" : "Needs Review") : "In Progress"}
                    </Badge>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {session.topicName || "General Assessment"}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                         {Math.round(session.timeTaken / 60)}m
                    </span>
                    <span>•</span>
                    <span>{session.totalQuestions} Questions</span>
                </div>
            </div>

            {/* Metrics (Only if completed) */}
            {isCompleted && (
                <div className="flex items-center gap-6 border-l border-border/50 pl-6 pr-2 py-1">
                    <div className="text-center">
                        <div className={cn("text-lg font-bold", passed ? "text-emerald-500" : "text-amber-500")}>
                            {accuracy}%
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Accuracy</div>
                    </div>

                    {/* Quality Indicator */}
                     <div className="text-center hidden sm:block">
                        <div className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                            {quality}
                            <span className="text-[10px] text-muted-foreground font-normal">/100</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Quality</div>
                    </div>

                    {/* Trend Icon */}
                    <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50">
                        {trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                        {trend === "down" && <TrendingDown className="w-4 h-4 text-rose-500" />}
                        {trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
                    </div>
                </div>
            )}

            {/* Action */}
            <div className="hidden group-hover:block sm:block">
                 <Button
                    size="sm"
                    variant={isCompleted ? "ghost" : "default"}
                    className={cn(
                        "transition-all",
                        isCompleted ? "text-muted-foreground hover:text-primary hover:bg-primary/5" : "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                    )}
                    onClick={() => {
                        const path = isCompleted ? `/analysis/${session.sessionId}` : `/exam/${session.sessionId}`;
                        router.push(path);
                    }}
                >
                    {isCompleted ? (
                        <>Review <ArrowRight className="ml-1.5 w-3.5 h-3.5" /></>
                    ) : (
                        <>Resume <Play className="ml-1.5 w-3.5 h-3.5 fill-current" /></>
                    )}
                </Button>
            </div>
        </div>
    </div>
  );
});

HistoryTimelineItem.displayName = "HistoryTimelineItem";
