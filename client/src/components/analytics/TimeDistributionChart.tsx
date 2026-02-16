"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TimeDistributionChartProps {
  data: {
    range: string; // e.g., "0-10m", "10-20m"
    count: number;
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
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-lg font-bold font-heading text-amber-500">
            {payload[0].value} Sessions
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function TimeDistributionChart({ data }: TimeDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center bg-muted/5 rounded-xl border border-dashed border-border/50">
        <p className="text-muted-foreground text-sm">No session data available</p>
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} className="dark:stroke-white/10" />
          <XAxis
            dataKey="range"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar
            dataKey="count"
            fill="#f59e0b"
            radius={[6, 6, 0, 0]}
            barSize={40}
            fillOpacity={0.9}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#f59e0b" : "#fbbf24"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
