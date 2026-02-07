"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AIUsageChart } from "@/components/AdminCharts";
import { Badge } from "@/components/ui/badge";

export default function AIStatusPage() {
    return (
        <div className="p-6 space-y-8 text-white">
            <h1 className="text-3xl font-bold">AI Control Center</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Provider Status */}
                 <Card className="border-white/10 bg-[#18181b]">
                    <CardHeader>
                        <CardTitle>Provider Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-medium">OpenAI (GPT-4o)</span>
                            </div>
                            <Badge variant="success" className="bg-green-500/10 text-green-400">Operational</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-medium">Google Gemini 1.5</span>
                            </div>
                            <Badge variant="success" className="bg-green-500/10 text-green-400">Operational</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="font-medium">Anthropic Cloud</span>
                            </div>
                            <Badge variant="warning" className="bg-yellow-500/10 text-yellow-400">High Latency</Badge>
                        </div>
                    </CardContent>
                 </Card>

                 {/* Cost Estimates */}
                 <Card className="border-white/10 bg-[#18181b]">
                    <CardHeader>
                        <CardTitle>Estimated Cost (Today)</CardTitle>
                        <CardDescription>Real-time projection based on token usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white mb-2">$4.85</div>
                        <div className="text-sm text-gray-400 mb-6">vs $5.12 yesterday (-5%)</div>

                        <div className="space-y-2">
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-400">OpenAI</span>
                                <span>$3.20</span>
                             </div>
                             <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                 <div className="bg-green-500 h-full w-[65%]"></div>
                             </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>

            <Card className="border-white/10 bg-[#18181b]">
                <CardHeader>
                    <CardTitle>Real-Time Usage</CardTitle>
                </CardHeader>
                <CardContent>
                    <AIUsageChart />
                </CardContent>
            </Card>
        </div>
    );
}
