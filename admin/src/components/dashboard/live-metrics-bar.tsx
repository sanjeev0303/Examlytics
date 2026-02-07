"use client";

import { useRealTimeMetrics } from "@/hooks/use-real-time-metrics";
import { Users, Play, Cpu, Activity } from "lucide-react";

export const LiveMetricsBar = () => {
    const { data } = useRealTimeMetrics();

    if (!data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-800/50 rounded-xl border border-gray-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <MetricCard
                label="LIVE USERS"
                value={data.active_users}
                icon={Users}
                color="text-blue-500"
                pulseColor="bg-blue-500"
            />
            <MetricCard
                label="EXAMS RUNNING"
                value={data.exams_in_progress}
                icon={Play}
                color="text-green-500"
                pulseColor="bg-green-500"
            />
            <MetricCard
                label="AI REQUESTS/MIN"
                value={data.ai_rpm}
                icon={Cpu}
                color="text-purple-500"
                pulseColor="bg-purple-500"
            />
            <MetricCard
                label="SYSTEM ERROR RATE"
                value={`${data.error_rate}%`}
                icon={Activity}
                color={data.error_rate > 1 ? "text-red-500" : "text-emerald-500"}
                pulseColor={data.error_rate > 1 ? "bg-red-500" : "bg-emerald-500"}
                subtext={data.system_status.toUpperCase()}
            />
        </div>
    );
};

const MetricCard = ({ label, value, icon: Icon, color, pulseColor, subtext }: any) => (
    <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon className={`w-16 h-16 ${color}`} />
        </div>

        <div>
            <p className="text-xs font-bold text-gray-500 tracking-wider mb-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${pulseColor} animate-pulse relative`}>
                     <span className={`absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75 animate-ping`}></span>
                </span>
                {label}
            </p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
            {subtext && <p className={`text-[10px] font-bold mt-1 ${color}`}>{subtext}</p>}
        </div>
    </div>
);
