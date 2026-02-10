"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TopicRadarChartProps {
  data: {
    topic: string;
    score: number;
    fullMark: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border border-border/50 shadow-xl rounded-xl p-3 backdrop-blur-sm">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
          <span className="text-lg font-bold font-heading text-sky-500">
            {payload[0].value}% Mastery
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function TopicRadarChart({ data }: TopicRadarChartProps) {
  if (!data || data.length < 3) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-muted/5 rounded-xl border border-dashed border-border/50">
        <p className="text-muted-foreground text-sm">Need at least 3 topics for radar analysis</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" strokeOpacity={0.5} className="dark:stroke-white/10" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Mastery"
            dataKey="score"
            stroke="#0ea5e9" // sky-500
            strokeWidth={2}
            fill="#0ea5e9"
            fillOpacity={0.2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
