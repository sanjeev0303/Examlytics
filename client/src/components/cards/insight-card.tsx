import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsightCardProps {
  insight: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "neural" | "warning";
  className?: string;
}

export function InsightCard({
  insight,
  actionLabel,
  onAction,
  className,
}: InsightCardProps) {
  return (
    <Card
        variant="flat"
        className={cn(
            "relative overflow-hidden border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500/20 h-[140px]",
            className
        )}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl dark:bg-indigo-400/10" />

      <CardContent className="p-5 flex gap-4">
        <div className="shrink-0 pt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <Sparkles className="h-4 w-4" />
            </div>
        </div>

        <div className="space-y-3 flex-1">
            <h4 className="text-sm font-semibold text-indigo-950 dark:text-indigo-100 uppercase tracking-wider text-[10px]">
                AI Analyst Insight
            </h4>
            <p className="text-sm text-text-primary leading-relaxed font-medium">
                &quot;{insight}&quot;
            </p>

            {actionLabel && (
                <Button
                    variant="link"
                    className="p-0 h-auto text-indigo-600 dark:text-indigo-400 text-xs hover:no-underline hover:opacity-80 group"
                    onClick={onAction}
                >
                    {actionLabel}
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
