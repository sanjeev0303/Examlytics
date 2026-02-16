"use client";

import React from "react";
import { motion } from "framer-motion";

export const FinalCTAIsland = () => {
  return (
    <div className="mt-20 relative h-[300px] w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-white/10 glass-panel flex items-center justify-center">
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-brand-primary/20 z-0" />

      <div className="relative z-10 flex items-center justify-center gap-4 md:gap-12 px-6">
        {/* Step 1: Student */}
        <div className="flex flex-col items-center gap-4 text-center group">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
            <span className="text-2xl">👨‍🎓</span>
          </div>
          <p className="text-sm font-medium text-white/40 group-hover:text-white/70 transition-colors">Student</p>
        </div>

        {/* Arrow */}
        <div className="h-[2px] w-8 md:w-16 bg-linear-to-r from-white/10 to-white/30 rounded-full" />

        {/* Step 2: Confidence */}
        <div className="flex flex-col items-center gap-4 text-center group">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shadow-[0_0_30px_-10px_rgba(var(--brand-primary),0.3)]">
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-sm font-medium text-brand-primary/80">Confidence</p>
        </div>

        {/* Arrow */}
        <div className="h-[2px] w-8 md:w-16 bg-linear-to-r from-white/10 to-white/30 rounded-full" />

        {/* Step 3: Success */}
        <div className="flex flex-col items-center gap-4 text-center group">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]">
            <span className="text-2xl">🚀</span>
          </div>
          <p className="text-sm font-medium text-white/90">Career Success</p>
        </div>
      </div>
    </div>
  );
};
