"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { memo } from "react";

export type ChartType = "area" | "bar" | "line";

interface ChartFactoryProps {
  type: ChartType;
  data: Record<string, unknown>[];
  xKey: string;
  dataKey: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
}

const CommonXAxis = ({ dataKey }: { dataKey: string }) => (
  <XAxis
    dataKey={dataKey}
    stroke="#888888"
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
);

const CommonYAxis = () => (
    <YAxis
      stroke="#888888"
      fontSize={12}
      tickLine={false}
      axisLine={false}
      tickFormatter={(value) => `${value}`}
    />
);

const CommonTooltip = () => (
    <Tooltip
        contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
        labelStyle={{ color: "#374151" }}
    />
);

export const ChartFactory = memo(({ type, data, xKey, dataKey, color = "#4f46e5", height = 350, showGrid = true }: ChartFactoryProps) => {
  const strategies = {
    area: (
      <AreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />}
        <CommonXAxis dataKey={xKey} />
        <CommonYAxis />
        <CommonTooltip />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} />
      </AreaChart>
    ),
    bar: (
      <BarChart data={data}>
         {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />}
        <CommonXAxis dataKey={xKey} />
        <CommonYAxis />
        <CommonTooltip />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    ),
    line: (
      <LineChart data={data}>
         {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />}
         <CommonXAxis dataKey={xKey} />
         <CommonYAxis />
        <CommonTooltip />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    ),
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {strategies[type]}
    </ResponsiveContainer>
  );
});

ChartFactory.displayName = "ChartFactory";
