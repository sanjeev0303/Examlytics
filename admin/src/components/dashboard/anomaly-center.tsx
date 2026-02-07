"use client";

import { useAnomalies, Anomaly } from "@/hooks/use-anomalies";
import { AlertCircle, ShieldAlert, Zap, BookOpen, CheckCircle, ChevronDown, ChevronRight, BrainCircuit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";

export const AnomalyCenter = () => {
    const { data: anomalies, isLoading } = useAnomalies();
    const [resolvedIds, setResolvedIds] = useState<string[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (isLoading) return null;

    const activeAnomalies = anomalies?.filter(a => !resolvedIds.includes(a.id)) || [];

    if (activeAnomalies.length === 0) {
        return (
            <Card className="border-green-500/20 bg-green-500/5 mb-6">
                <CardContent className="flex items-center gap-4 py-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                        <h4 className="text-green-400 font-bold">System Normal</h4>
                        <p className="text-sm text-green-500/60">No automated anomalies detected by AI logic.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-red-500/20 bg-red-500/5 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <CardHeader className="pb-2">
                <CardTitle className="text-red-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                         Anomaly Center
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                            {activeAnomalies.length}
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {activeAnomalies.map((anomaly) => (
                    <div key={anomaly.id} className="bg-[#18181b] border border-white/10 rounded-lg overflow-hidden group hover:border-red-500/30 transition-colors">

                        {/* Header Row */}
                        <div
                            className="p-4 cursor-pointer flex justify-between items-start"
                            onClick={() => setExpandedId(expandedId === anomaly.id ? null : anomaly.id)}
                        >
                            <div className="flex gap-3">
                                 <div className={`mt-1 w-2 h-2 rounded-full ${getSeverityColor(anomaly.severity, 'bg')} animate-pulse`} />
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-white font-bold text-sm tracking-tight">{anomaly.title}</h4>
                                        <SeverityBadge severity={anomaly.severity} />
                                    </div>
                                    <p className="text-xs text-gray-400">{anomaly.ai_insight.summary}</p>
                                 </div>
                            </div>
                            {expandedId === anomaly.id ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                        </div>

                        {/* Expanded Details */}
                        {expandedId === anomaly.id && (
                            <div className="px-4 pb-4 pt-0 border-t border-white/5 bg-black/20">
                                <div className="mt-3 space-y-3">

                                    {/* AI Confidence */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <BrainCircuit className="w-3 h-3 text-purple-400" />
                                        <span className="text-gray-400">AI Confidence:</span>
                                        <div className="h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500 rounded-full"
                                                style={{ width: `${anomaly.ai_insight.confidence * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-purple-400 font-bold">{(anomaly.ai_insight.confidence * 100).toFixed(0)}%</span>
                                    </div>

                                    {/* Likely Causes */}
                                    <div>
                                        <h5 className="text-[10px] uppercase text-gray-500 font-bold mb-1">Likely Causes</h5>
                                        <ul className="list-disc pl-4 space-y-0.5">
                                            {anomaly.ai_insight.likely_causes.map((cause, i) => (
                                                <li key={i} className="text-xs text-gray-300">{cause}</li>
                                            ))}
                                        </ul>
                                    </div>

                                     {/* Recommended Actions */}
                                     <div>
                                        <h5 className="text-[10px] uppercase text-gray-500 font-bold mb-1">Recommended Actions</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {anomaly.ai_insight.recommended_actions.map((action, i) => (
                                                <span key={i} className="text-xs bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                                                    {action}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setResolvedIds(prev => [...prev, anomaly.id]);
                                            }}
                                            className="text-xs text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
                                        >
                                            Mark Resolved
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const SeverityBadge = ({ severity }: { severity: Anomaly['severity'] }) => {
    return (
        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getSeverityColor(severity, 'badge')}`}>
            {severity}
        </span>
    );
};

const getSeverityColor = (severity: string, type: 'bg' | 'text' | 'badge') => {
    const map: any = {
        LOW: { bg: "bg-blue-500", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
        MEDIUM: { bg: "bg-yellow-500", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
        HIGH: { bg: "bg-orange-500", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
        CRITICAL: { bg: "bg-red-500", badge: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    return map[severity]?.[type] || map.LOW[type];
};
