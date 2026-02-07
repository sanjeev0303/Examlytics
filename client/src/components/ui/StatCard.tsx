"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  subtext?: string;
}

export function StatCard({ label, value, trend, icon: Icon, subtext }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {value}
            </h3>
            {trend && (
              <span className={cn(
                "flex items-center text-xs font-medium",
                trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-primary/5 p-2 text-primary dark:bg-primary/10">
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      {(subtext || trend) && (
        <p className="mt-2 text-xs text-muted-foreground">
          {subtext || (trend ? "vs last week" : "")}
        </p>
      )}

      {/* Subtle bottom gradient line on hover */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
    </div>
  );
}
