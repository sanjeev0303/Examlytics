"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TopicData {
  topic: string
  score: number // User's score
  benchmark: number // Cohort/Role benchmark
}

interface TopicRadarProps {
  data: TopicData[]
  className?: string
}

export function TopicRadar({ data, className }: TopicRadarProps) {
    const config = {
        score: {
            label: "Your Skill",
            color: "hsl(var(--chart-1))",
        },
        benchmark: {
            label: "Role Target",
            color: "hsl(var(--chart-4))",
        },
    }

  return (
    <Card className={cn("h-[430px]", className)}>
      <CardHeader className="items-center pb-4">
        <CardTitle>Skill Profile</CardTitle>
        <CardDescription>
          Vs Target Role (Backend Dev)
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="h-[300px] w-full min-w-0">
            <ChartContainer config={config} className="h-full w-full max-h-[300px]">
                <RadarChart data={data}>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                    <PolarGrid gridType="circle" stroke="var(--border-subtle)" />

                    <PolarAngleAxis
                        dataKey="topic"
                        tick={{ fill: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}
                    />

                    {/* User Score */}
                    <Radar
                        dataKey="score"
                        stroke="var(--color-chart-1)"
                        fill="var(--color-chart-1)"
                        fillOpacity={0.4}
                        dot={{ r: 3, fillOpacity: 1 }}
                    />

                    {/* Benchmark (Line only) */}
                    <Radar
                        dataKey="benchmark"
                        stroke="var(--color-chart-4)"
                        fill="transparent"
                        strokeDasharray="4 4"
                    />
                </RadarChart>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
