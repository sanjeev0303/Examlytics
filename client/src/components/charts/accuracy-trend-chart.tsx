"use client"

import { Area, ComposedChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AccuracyData {
  date: string
  score: number
  avg: number // Rolling average
}

interface AccuracyTrendChartProps {
  data: AccuracyData[]
  className?: string
}

export function AccuracyTrendChart({ data, className }: AccuracyTrendChartProps) {
    const config = {
        score: {
            label: "Score",
            color: "hsl(var(--chart-1))",
        },
        avg: {
            label: "Rolling Avg",
            color: "hsl(var(--chart-2))",
        },
    }

  return (
    <Card className={cn("h-[430px]", className)}>
      <CardHeader>
        <CardTitle>Accuracy Trend</CardTitle>
        <CardDescription>
          Performance over time vs rolling average
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
            <ChartContainer config={config} className="h-full w-full">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                        domain={[0, 100]}
                    />
                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />

                    {/* Area for "Confidence/Volume" feel */}
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="none"
                        fill="url(#fillScore)"
                    />

                    {/* Main Score Line */}
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-chart-1)"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "var(--bg-surface)", strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />

                    {/* Rolling Average Line */}
                    <Line
                        type="monotone"
                        dataKey="avg"
                        stroke="var(--color-text-muted)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                </ComposedChart>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
