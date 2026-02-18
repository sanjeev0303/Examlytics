"use client";

import { Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ModelStat {
  name: string;
  status: "OPEN" | "CLOSED";
  used: number;
  limit: number;
  remaining?: number;
}

export function AIModelStatusCard({ models = [] }: { models: ModelStat[] }) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 backdrop-blur-xl shadow-lg shadow-blue-500/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white">AI Model Status</h3>
        <Brain className="text-blue-500" size={20} />
      </div>

      <div className="space-y-6">
        {models.map((m) => {
          const used = m.used || 0;
          const limit = m.limit || 1000000;
          const remaining = m.remaining ?? (limit - used);
          const percentage = Math.min(100, (used / limit) * 100);

          return (
            <div key={m.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{m.name}</span>
                   <div className={cn(
                     "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                     m.status === "CLOSED" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                   )}>
                     {m.status === "CLOSED" ? "Active" : "Degraded"}
                   </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-tight">Consumption</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">{used.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-600">/ {limit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="relative h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    percentage > 90 ? "bg-linear-to-r from-red-500 to-rose-600" :
                    percentage > 70 ? "bg-linear-to-r from-amber-500 to-orange-600" :
                    "bg-linear-to-r from-blue-500 to-indigo-600"
                  )}
                />
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Zap size={10} className="text-amber-500" />
                  <span className="font-medium">Tokens Left:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300 font-mono">{remaining.toLocaleString()}</span>
                </div>
                <div className="text-gray-400 font-medium">
                  {Math.round(percentage)}% of limit
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
