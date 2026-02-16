"use client";

import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { AntigravityCard } from "@/components/cards/AntigravityCard";

export const WeakTopicIsland = () => {
  return (
    <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
      <AntigravityCard className="relative z-10 overflow-visible">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Organic Chemistry</h3>
            <p className="text-sm text-white/40">Reaction Mechanisms</p>
          </div>
          <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            CRITICAL
          </div>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
          <div className="relative pl-8">
            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-white/20" />
            <p className="text-xs text-white/40 mb-1">Today</p>
            <div className="bg-brand-dark p-3 rounded-lg border border-white/5">
              <p className="text-sm">Diagnostic Failed (45% acc)</p>
            </div>
          </div>

          <div className="relative pl-8">
            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-primary" />
            <p className="text-xs text-white/40 mb-1">Recommended Action</p>
            <div className="bg-brand-primary/10 p-3 rounded-lg border border-brand-primary/20 flex justify-between items-center group cursor-pointer hover:bg-brand-primary/20 transition-colors">
              <div>
                <p className="text-sm font-bold text-brand-primary">Practice: Nucleophilic Subst.</p>
                <p className="text-xs text-white/50">20 Questions • 15 Mins</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-brand-primary bg-brand-primary/20 px-2 py-1 rounded group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  Fix Now
                </span>
                <ArrowRight className="w-4 h-4 text-brand-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div className="relative pl-8 opacity-50">
            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-white/10" />
            <p className="text-xs text-white/40 mb-1">Projected • +5 Days</p>
            <div className="bg-brand-dark p-3 rounded-lg border border-dashed border-white/10">
              <p className="text-sm">Mastery Achieved (+15 Marks)</p>
            </div>
          </div>
        </div>
      </AntigravityCard>

      {/* Glow behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-warm/10 blur-[80px] -z-10 rounded-full" />
    </div>
  );
};
