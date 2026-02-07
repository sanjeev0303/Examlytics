"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface TimeDistributionChartProps {
  data: any[];
  config: any;
}

export default function TimeDistributionChart({ data, config }: TimeDistributionChartProps) {
  return (
    <ChartContainer config={config} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            dy={10}
          />
          <Tooltip
            cursor={{ fill: 'var(--accent)', opacity: 0.3 }}
            contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '8px', border: '1px solid var(--border)' }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
          <Bar
            dataKey="timeTaken"
            fill="var(--color-secondary)"
            radius={[4, 4, 0, 0]}
            barSize={40}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
