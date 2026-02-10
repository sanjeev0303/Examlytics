"use client";

import React from "react";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const FinalCTASection = () => {
  return (
    <div className="relative bg-[#02020a] pt-32 pb-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-primary/10 blur-[120px] rounded-[100%] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Main CTA */}
        <div className="text-center max-w-4xl mx-auto mb-60">
           <h2 className="text-4xl md:text-7xl font-heading font-bold mb-8 bg-clip-text text-transparent bg-linear-to-b from-white to-white/40">
             Your preparation deserves intelligence.
           </h2>
           <p className="text-xl text-white/50 mb-10">
             Join thousands of students who have switched from guesswork to data-driven success.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
              <AntigravityButton size="lg" className="w-full sm:w-auto">
                 Start Free
                 <ArrowRight className="ml-2 w-5 h-5" />
              </AntigravityButton>
              <AntigravityButton variant="secondary" size="lg" className="w-full sm:w-auto">
                 Explore Demo
              </AntigravityButton>
              <AntigravityButton variant="glass" size="lg" className="w-full sm:w-auto">
                 Talk to Us
              </AntigravityButton>
           </div>

           {/* Emotional Illustration: Student -> Confidence -> Career Success */}
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
        </div>
        </div>
    </div>
  );
};
