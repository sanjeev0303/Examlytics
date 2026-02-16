"use client";

import React from "react";
import { Brain, TrendingUp, Target } from "lucide-react";
import { AntigravityCard } from "@/components/cards/AntigravityCard";
import { FloatingElement } from "@/components/ui/FloatingElement";

export const HeroVisuals = () => {
  return (
    <div className="relative h-150 hidden lg:block perspective-1000">
      {/* Central AI Brain */}
      <FloatingElement depth={1} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative w-64 h-64 bg-linear-to-tr from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(99,102,241,0.5)] animate-float">
          <Brain className="w-32 h-32 text-white/90" />
          <div className="absolute inset-0 border border-white/20 rounded-full scale-110" />
          <div className="absolute inset-0 border border-white/10 rounded-full scale-125" />
        </div>
      </FloatingElement>

      {/* Floating Stats Cards */}
      <FloatingElement depth={2} delay={1} className="top-20 right-10 z-20">
        <AntigravityCard variant="glass" className="p-4 flex items-center gap-4 w-64">
          <div className="p-3 bg-brand-accent/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <p className="text-sm text-white/60">Accuracy Trend</p>
            <p className="text-xl font-bold text-white">+24% This Week</p>
          </div>
        </AntigravityCard>
      </FloatingElement>

      <FloatingElement depth={3} delay={2} className="bottom-32 left-0 z-20">
        <AntigravityCard variant="glass" className="p-4 w-72">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">Weak Topic Detected</span>
            <span className="text-brand-warm text-xs font-bold">High Priority</span>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-brand-warm" />
            <div>
              <p className="text-white font-medium">Thermodynamics</p>
              <p className="text-xs text-white/40">Physics • Class 11</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-warm h-full w-[45%]" />
          </div>
        </AntigravityCard>
      </FloatingElement>

      <FloatingElement depth={1.5} delay={0.5} className="top-40 left-10 -z-10 opacity-60 scale-75 blur-[2px]">
        <AntigravityCard variant="solid" className="w-48 h-32 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold text-brand-secondary">98.5</p>
            <p className="text-sm text-white/40">Percentile Predicted</p>
          </div>
        </AntigravityCard>
      </FloatingElement>
    </div>
  );
};
