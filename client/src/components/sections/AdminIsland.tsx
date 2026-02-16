"use client";

import React from "react";
import { Server, Eye } from "lucide-react";
import { AntigravityCard } from "@/components/cards/AntigravityCard";

export const AdminIsland = () => {
  return (
    <div className="relative perspective-1000 order-2 lg:order-1">
      <AntigravityCard className="w-full aspect-4/3 bg-[#0f1020] border-white/10 p-4 relative z-10 transition-transform duration-700 hover:rotate-x-3 hover:rotate-y-3">
        <div className="flex border-b border-white/5 pb-2 mb-4">
          <div className="text-xs font-mono text-white/50">admin_console</div>
          <div className="ml-auto flex gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-500">System Online</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs text-white/40 mb-1">Active Users</p>
            <p className="text-xl font-mono">12,405</p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs text-white/40 mb-1">Model Accuracy</p>
            <p className="text-xl font-mono text-brand-accent">99.2%</p>
          </div>
        </div>

        <div className="h-32 bg-white/5 rounded flex items-center justify-center border border-dashed border-white/10">
          <span className="text-xs text-white/30">Training Data Stream Visualization</span>
        </div>
      </AntigravityCard>

      {/* Floating Panels */}
      <div className="absolute -right-8 top-10 z-20">
        <AntigravityCard variant="glass" className="p-3 w-48">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Server className="w-3 h-3" />
            <span>Dataset Management</span>
          </div>
        </AntigravityCard>
      </div>

      <div className="absolute -left-8 bottom-20 z-20">
        <AntigravityCard variant="glass" className="p-3 w-48">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Eye className="w-3 h-3" />
            <span>Live Proctoring</span>
          </div>
        </AntigravityCard>
      </div>
    </div>
  );
};
