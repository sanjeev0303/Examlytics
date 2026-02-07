"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

const anomalies = [
  {
    id: "ANOM-001",
    type: "Suspicious Score Spike",
    severity: "HIGH",
    confidence: 0.92,
    user: "alex.doe@example.com",
    timestamp: "2 mins ago",
    status: "OPEN"
  },
  {
    id: "ANOM-002",
    type: "Rapid Completion",
    severity: "MEDIUM",
    confidence: 0.78,
    user: "sarah.smith@example.com",
    timestamp: "15 mins ago",
    status: "OPEN"
  },
  {
    id: "ANOM-003",
    type: "Pattern Repetition",
    severity: "LOW",
    confidence: 0.45,
    user: "john.g@example.com",
    timestamp: "1 hour ago",
    status: "RESOLVED"
  }
];

export default function AnomaliesPage() {
  return (
    <div className="p-6 space-y-8 text-white">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold">Anomaly Detection Feed</h1>
           <p className="text-gray-400 mt-2">AI-driven insights into irregular exam behavior.</p>
        </div>
        <div className="flex gap-2">
            <Badge variant="outline" className="text-red-400 border-red-400/20 bg-red-400/10">3 High Risk</Badge>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/20 bg-yellow-400/10">12 Pending</Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {anomalies.map((anom) => (
          <Link href={`/anomalies/${anom.id}`} key={anom.id}>
            <Card className="border-white/10 bg-[#18181b] hover:bg-[#202025] transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    anom.severity === 'HIGH' ? 'bg-red-500/10 text-red-500' :
                    anom.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">{anom.type}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{anom.id}</span>
                        <span>•</span>
                        <span>{anom.user}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Confidence</div>
                        <div className={`font-mono font-bold ${anom.confidence > 0.8 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {(anom.confidence * 100).toFixed(0)}%
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Time</div>
                        <div className="text-gray-300 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {anom.timestamp}
                        </div>
                    </div>
                     <Badge variant={anom.status === 'OPEN' ? 'destructive' : 'secondary'}>
                        {anom.status}
                    </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
