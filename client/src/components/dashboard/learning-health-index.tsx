import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";

interface LearningHealthIndexProps {
  score: number; // 0-100
  trend?: number; // Delta
  className?: string;
}

export function LearningHealthIndex({
  score,
  trend = 0,
  className,
}: LearningHealthIndexProps) {
  // Color logic based on score
  const getColor = (s: number) => {
    if (s >= 80) return "text-success stroke-success";
    if (s >= 60) return "text-warning stroke-warning";
    return "text-critical stroke-critical";
  };

  const colorClass = getColor(score);

  // Circumference for SVG circle
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-text-secondary flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Learning Health Index
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center relative pb-6">
        <div className="relative h-32 w-32 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                    className="text-border-subtle"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                />
                {/* Progress Circle */}
                <circle
                    className={cn("transition-all duration-1000 ease-out", colorClass)}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={cn("text-3xl font-bold font-heading", colorClass.split(" ")[0])}>
                    {score}
                </span>
                {trend !== 0 && (
                    <span className="text-xs font-medium text-text-secondary flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" />
                         {trend > 0 ? "+" : ""}{trend}
                    </span>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
