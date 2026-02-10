"use client";

import { Flame, Trophy, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export function StreakCounter({ currentStreak, longestStreak, totalActiveDays }: StreakCounterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-none shadow-sm bg-orange-50/50 dark:bg-orange-500/5 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600/80 dark:text-orange-400/80 uppercase tracking-wider">Current Streak</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {currentStreak} <span className="text-base font-normal text-muted-foreground">days</span>
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-amber-50/50 dark:bg-amber-500/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
             <div>
              <p className="text-xs font-semibold text-amber-600/80 dark:text-amber-400/80 uppercase tracking-wider">Best Streak</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {longestStreak} <span className="text-base font-normal text-muted-foreground">days</span>
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
             <div>
              <p className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider">Total Active</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {totalActiveDays} <span className="text-base font-normal text-muted-foreground">days</span>
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
