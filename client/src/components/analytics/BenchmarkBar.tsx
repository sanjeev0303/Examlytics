"use client";

import { cn } from "@/lib/utils";

interface BenchmarkProps {
    userScore: number;
    cohortScore: number;
    label: string;
}

export function BenchmarkBar({ userScore, cohortScore, label }: BenchmarkProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">{label}</span>
                <span className="font-bold text-foreground">
                    {userScore}% <span className="text-xs text-muted-foreground font-normal">vs {cohortScore}%</span>
                </span>
            </div>
            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden relative">
                {/* Cohort Marker */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-muted-foreground/30 z-10"
                    style={{ left: `${cohortScore}%` }}
                    title={`Cohort: ${cohortScore}%`}
                />
                <div
                    className="absolute -top-1 w-0.5 h-4 bg-muted-foreground/50 z-20"
                    style={{ left: `${cohortScore}%` }}
                />

                {/* User Fill */}
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500",
                        userScore >= cohortScore ? "bg-emerald-500" : "bg-amber-500"
                    )}
                    style={{ width: `${userScore}%` }}
                />
            </div>
        </div>
    );
}
