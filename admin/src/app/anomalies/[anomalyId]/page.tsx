"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Slash, Activity } from "lucide-react";

export default function AnomalyDetailPage({ params }: { params: { anomalyId: string } }) {
  return (
    <div className="p-6 space-y-8 text-white max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
             <div className="flex items-center gap-3 mb-2">
                 <Badge variant="outline" className="text-red-400 border-red-400/20 bg-red-400/10">HIGH SEVERITY</Badge>
                 <span className="text-gray-500 text-sm font-mono">ID: {params.anomalyId}</span>
             </div>
             <h1 className="text-3xl font-bold">Suspicious Score Spike</h1>
             <p className="text-gray-400 mt-1">Detected a 45% increase in score performance within 24 hours.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                <Slash className="w-4 h-4 mr-2" />
                Flag User
            </Button>
            <Button className="bg-white text-black hover:bg-gray-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve as False Positive
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Explanation */}
        <Card className="col-span-2 border-white/10 bg-[#18181b]">
            <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                    The user <span className="text-white font-medium">alex.doe@example.com</span> completed the "Advanced Thermodynamics" exam in <span className="text-yellow-400">12 minutes</span> (Avg: 45 mins).
                    Furthermore, their accuracy on "Concept Application" questions jumped from <span className="text-red-400">12%</span> (historically) to <span className="text-green-400">98%</span> in this session.
                </p>
                <div className="p-4 rounded-lg bg-black/40 border border-white/5 mt-4">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Confidence Factors</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                            <span>Time to completion deviation</span>
                            <span className="text-red-400 font-mono">+3.2σ</span>
                        </li>
                         <li className="flex justify-between">
                            <span>Topic mastery velocity</span>
                            <span className="text-red-400 font-mono">Unrealistic</span>
                        </li>
                         <li className="flex justify-between">
                            <span>Mouse movement entropy</span>
                            <span className="text-green-400 font-mono">Normal</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>

        {/* Sidebar Stats */}
        <div className="space-y-6">
            <Card className="border-white/10 bg-[#18181b]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Confidence Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-red-500">92%</div>
                    <p className="text-xs text-gray-500 mt-1">High probability of irregularity</p>
                </CardContent>
            </Card>

             <Card className="border-white/10 bg-[#18181b]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">User History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span>Account Age</span>
                        <span className="text-white">12 days</span>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span>Prev Anomalies</span>
                        <span className="text-white">0</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
