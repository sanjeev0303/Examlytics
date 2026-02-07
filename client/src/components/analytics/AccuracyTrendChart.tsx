"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface AccuracyTrendChartProps {
  data: any[];
  config: any;
}

export default function AccuracyTrendChart({ data, config }: AccuracyTrendChartProps) {
  return (
    <ChartContainer config={config} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            dy={10}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '8px', border: '1px solid var(--border)' }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--color-primary)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScore)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
