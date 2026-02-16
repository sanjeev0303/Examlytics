"use client";

import { memo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, PlayCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { ExamHistoryItem } from "@/types";

interface HistoryItemProps {
  session: ExamHistoryItem;
  style?: React.CSSProperties; // Passed by react-window if needed, but we handle it in parent wrapper mostly
}

export const HistoryItem = memo(({ session }: HistoryItemProps) => {
  const router = useRouter();
  const isCompleted = session.status === 'COMPLETED';
  const accuracy = session.totalQuestions > 0 ? Math.round((session.score / session.totalQuestions) * 100) : 0;
  const passed = accuracy >= 70;

  return (
    <Card
        className="group hover:border-accent-primary/30 transition-all duration-200"
        variant="flat"
    >
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">

            {/* Left: Time & Status */}
            <div className="flex flex-col gap-1 min-w-[80px]">
                 <span className="text-xs font-mono text-text-muted">
                    {format(new Date(session.startedAt), "h:mm a")}
                 </span>
                 <Badge variant={isCompleted ? (passed ? "success" : "warning") : "secondary"} className="w-fit">
                    {isCompleted ? (passed ? "Passed" : "Needs Work") : "In Progress"}
                 </Badge>
            </div>

            {/* Middle: Info */}
            <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-text-primary line-clamp-1">
                    {session.topicName || "General Assessment"}
                </h3>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(session.timeTaken / 60)}m
                    </span>
                    <span>•</span>
                    <span>{session.totalQuestions} Qs</span>
                </div>
            </div>

            {/* Right: Actions & Score */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                {isCompleted && (
                    <div className="text-right">
                        <div className={`text-xl font-bold font-mono ${passed ? 'text-success' : 'text-warning'}`}>
                            {accuracy}%
                        </div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider">Score</div>
                    </div>
                )}

                <Button
                    size="sm"
                    variant={isCompleted ? "ghost" : "default"}
                    className={isCompleted ? "text-text-secondary hover:text-text-primary" : "bg-accent-primary text-white"}
                    onClick={() => {
                        const path = isCompleted ? `/analysis/${session.sessionId}` : `/exam/${session.sessionId}`;
                        router.push(path);
                    }}
                >
                    {isCompleted ? (
                        <>Review <ArrowRight className="ml-1 w-3 h-3" /></>
                    ) : (
                        <>Resume <PlayCircle className="ml-1 w-3 h-3" /></>
                    )}
                </Button>
            </div>
        </CardContent>
    </Card>
  );
});

HistoryItem.displayName = "HistoryItem";
