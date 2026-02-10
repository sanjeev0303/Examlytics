import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  value: number; // Percentage or absolute value
  label?: string; // Optional text label like "% vs last week"
  direction?: "up" | "down" | "neutral"; // Explicit override, otherwise calculated from value
  invertColor?: boolean; // If true, up is bad (red) and down is good (green)
  className?: string;
}

export function TrendIndicator({
  value,
  label,
  direction,
  invertColor = false,
  className,
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  // Determine direction if not explicit
  const dir = direction || (isNeutral ? "neutral" : isPositive ? "up" : "down");

  // Determine color logic
  // Default: Up = Good (Green), Down = Bad (Red)
  // Inverted: Up = Bad (Red), Down = Good (Green) -> e.g., Drop in latency is good
  let colorClass = "text-text-secondary";
  if (dir === "up") colorClass = invertColor ? "text-critical" : "text-success";
  if (dir === "down") colorClass = invertColor ? "text-success" : "text-critical";

  const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;

  return (
    <div className={cn("flex items-center space-x-1.5 text-sm font-medium", colorClass, className)}>
      <Icon className="h-4 w-4" />
      <span>
        {Math.abs(value)}% {label}
      </span>
    </div>
  );
}
