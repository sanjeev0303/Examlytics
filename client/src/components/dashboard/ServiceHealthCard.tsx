"use client";

import { Activity, Database, Server, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthProps {
  server?: "online" | "offline";
  ai?: "online" | "offline";
  db?: "online" | "offline";
  redis?: "online" | "offline";
}

export function ServiceHealthCard({ server = "online", ai = "online", db = "online", redis = "online" }: HealthProps) {
  const services = [
    { name: "Go Server", status: server, icon: Server },
    { name: "AI Service", status: ai, icon: Cpu },
    { name: "PostgreSQL", status: db, icon: Database },
    { name: "Redis", status: redis, icon: Activity },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 backdrop-blur-xl shadow-lg shadow-blue-500/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white">Service Health</h3>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
           Live
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.name} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-white/5">
            <div className={cn(
              "p-2 rounded-xl transition-colors",
              s.status === "online" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              <s.icon size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{s.name}</span>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tighter",
                s.status === "online" ? "text-green-500" : "text-red-500"
              )}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
