"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { Flame, Trophy } from "lucide-react";

interface StreakWidgetProps {
  streakData: {
      currentStreak: number;
      longestStreak: number;
      activityCalendar: { date: string; count: number; hasExams: boolean; }[];
  } | undefined;
}

export function StreakWidget({ streakData }: StreakWidgetProps) {
  if (!streakData) return null;

  return (
    <Card className="mt-4 border-l-4 border-l-orange-500 shadow-sm bg-card h-[120px]">
        <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        <Flame className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold leading-none">{streakData.currentStreak} Days</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Current Streak</div>
                    </div>
                </div>
                 <div className="flex items-center gap-2 text-right">
                     <div>
                        <div className="text-lg font-bold leading-none">{streakData.longestStreak}</div>
                         <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Best</div>
                    </div>
                     <Trophy className="w-4 h-4 text-amber-500" />
                </div>
            </div>

            <div className="pt-2 border-t border-dashed border-border/50">
                <ActivityHeatmap activityData={streakData.activityCalendar} />
            </div>
        </CardContent>
    </Card>
  );
}
