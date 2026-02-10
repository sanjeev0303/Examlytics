"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface FocusData {
  minute: number
  accuracy: number
  timePerQuestion: number
}

interface FocusDecayChartProps {
  data: FocusData[]
  className?: string
}

export function FocusDecayChart({ data, className }: FocusDecayChartProps) {
    const config = {
        accuracy: {
            label: "Accuracy",
            color: "hsl(var(--chart-2))",
        },
        timePerQuestion: {
            label: "Time/Q (sec)",
            color: "hsl(var(--chart-3))",
        },
    }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Focus Decay Analysis</CardTitle>
        <CardDescription>
          Accuracy vs Speed over a 60m session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
            <ChartContainer config={config} className="h-full w-full">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <XAxis
                        dataKey="minute"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                        label={{ value: "Session Duration (min)", position: "insideBottom", offset: -5, fill: "var(--text-secondary)", fontSize: 10 }}
                    />
                    <YAxis
                        yAxisId="left"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                        domain={[0, 100]}
                        label={{ value: "Accuracy %", angle: -90, position: "insideLeft", fill: "var(--text-secondary)", fontSize: 10 }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                        label={{ value: "Time/Q (s)", angle: 90, position: "insideRight", fill: "var(--text-secondary)", fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />

                    {/* Accuracy Decay Line */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="var(--color-chart-2)"
                        strokeWidth={2}
                        dot={false}
                    />

                    {/* Time Per Question Line (Rising indicates fatigue) */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="timePerQuestion"
                        stroke="var(--color-chart-3)"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                    />

                    <ReferenceLine x={45} stroke="var(--critical)" strokeDasharray="3 3" label={{ value: "Focus Drop", fill: "var(--critical)", fontSize: 10 }} />
                </LineChart>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
