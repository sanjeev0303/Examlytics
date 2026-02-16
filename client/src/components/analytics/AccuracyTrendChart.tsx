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

interface AccuracyTrendChartProps {
  data: {
    date: string;
    score: number;
    originalDate?: string; // For sorting if needed, or just display
  }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    // Calculate delta if possible, need previous data point.
    // For simplicity here, just showing score.
    // In a real app, data processing would add 'delta' to the payload.

    return (
      <div className="bg-background/95 border border-border/50 shadow-xl rounded-xl p-3 backdrop-blur-sm">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-2xl font-bold font-heading text-indigo-500">
            {score}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function AccuracyTrendChart({ data }: AccuracyTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-muted/5 rounded-xl border border-dashed border-border/50">
        <p className="text-muted-foreground text-sm">No exam data available yet</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} className="dark:stroke-white/10" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1" // indigo-500
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScore)"
            activeDot={{ r: 6, strokeWidth: 0, fill: "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
