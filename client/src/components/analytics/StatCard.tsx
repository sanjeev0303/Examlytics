"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ElementType;
  className?: string;
  colorClass?: string; // e.g. "text-indigo-500 bg-indigo-500/10"
  tooltipText?: string;
}

export function StatCard({
  title,
  value,
  subValue,
  trend,
  trendValue,
  icon: Icon,
  className,
  colorClass,
  tooltipText
}: StatCardProps) {
  return (
    <Card className={cn("shadow-sm border border-border/50 bg-card hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
                {title}
                {tooltipText && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-[200px] text-xs">{tooltipText}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </CardTitle>
        <div className={cn("p-2 rounded-lg", colorClass || "text-primary bg-primary/10")}>
            <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-heading">{value}</div>
        {(subValue || trendValue) && (
            <div className="flex items-center gap-2 mt-1">
                {trend && trendValue && (
                     <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded",
                        trend === "up" ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" :
                        trend === "down" ? "text-rose-600 bg-rose-500/10 dark:text-rose-400" :
                        "text-gray-600 bg-gray-500/10 dark:text-gray-400"
                    )}>
                        {trendValue}
                    </span>
                )}
                <p className="text-xs text-muted-foreground">
                    {subValue}
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
