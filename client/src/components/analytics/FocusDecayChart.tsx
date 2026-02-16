"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FocusDecayChartProps {
  data: {
    minute: number;
    focus: number;
  }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border border-border/50 shadow-xl rounded-xl p-3 backdrop-blur-sm">
        <p className="text-sm font-medium text-foreground">Minute {label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-lg font-bold font-heading text-red-500">
            {payload[0].value}% Focus
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function FocusDecayChart({ data }: FocusDecayChartProps) {
  // Use mock data if empty (as per current implementation fallback logic, but cleaner)
  const chartData = (!data || data.length === 0) ? [
      { minute: 5, focus: 100 },
      { minute: 15, focus: 95 },
      { minute: 30, focus: 85 },
      { minute: 45, focus: 72 },
      { minute: 60, focus: 60 },
  ] : data;

  return (
    <div className="h-[200px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} className="dark:stroke-white/10" />
          <XAxis
            dataKey="minute"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            dy={10}
            label={{ value: 'Minutes into Session', position: 'insideBottom', offset: -10, fill: '#9ca3af', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            domain={[0, 100]}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ef4444", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Line
            type="monotone"
            dataKey="focus"
            stroke="#ef4444" // red-500
            strokeWidth={3}
            dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#ef4444" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
