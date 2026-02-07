"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AntigravityCard } from "@/components/ui/AntigravityCard";
import { AntigravityButton } from "@/components/ui/AntigravityButton";

export const WeakTopicSection = () => {
  return (
    <SectionWrapper>
      <div className="lg:flex items-center gap-16">
        <div className="lg:w-1/2 space-y-6">
          <span className="text-brand-warm font-bold tracking-wider text-sm uppercase">Smart Intervention</span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold">
            We find your <br />
            <span className="text-brand-warm">Weakest Links.</span>
          </h2>
          <p className="text-white/60 text-lg">
            Examlytics identifies the atomic concepts dragging your score down and creates a personalized recovery path to fix them.
          </p>
          <ul className="space-y-4">
             {["Concept-level diagnosis", "Targeted practice sets", "Video remediation", "Progress tracking"].map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-white/80">
                 <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                 {item}
               </li>
             ))}
          </ul>
          <AntigravityButton variant="secondary" className="mt-4">
             Start Diagnostic Test
          </AntigravityButton>
        </div>

        <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
           {/* Improvement Timeline Card */}
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
      </div>
    </SectionWrapper>
  );
};
