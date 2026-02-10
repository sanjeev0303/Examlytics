"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  activityData: Array<{
    date: string;
    count: number;
    hasExams: boolean;
  }>;
}

export function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
  const weeks = useMemo(() => {
    // Ensure we strictly follow 7-day chunks or align to weeks properly.
    // Assuming activityData is already a continuous array of days.
    const weekData: Array<Array<typeof activityData[0]>> = [];
    let currentWeek: Array<typeof activityData[0]> = [];

    activityData.forEach((day, idx) => {
      currentWeek.push(day);
      if ((idx + 1) % 7 === 0) {
        weekData.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weekData.push(currentWeek);
    }

    return weekData;
  }, [activityData]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800/50";
    if (count === 1) return "bg-emerald-300 dark:bg-emerald-800";
    if (count === 2) return "bg-emerald-400 dark:bg-emerald-600";
    return "bg-emerald-500 dark:bg-emerald-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1.5">
            {week.map((day) => (
              <div
                key={day.date}
                className={cn(
                    "w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-alias",
                    getColorClass(day.count)
                )}
                title={`${day.date}: ${day.count} ${day.count === 1 ? 'session' : 'sessions'}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
          </div>
          <span>More</span>
      </div>
    </div>
  );
}
