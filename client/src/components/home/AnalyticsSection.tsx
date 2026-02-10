"use client";

import React from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AntigravityCard } from "@/components/ui/AntigravityCard";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { Activity, Target, Trophy, Clock } from "lucide-react";

export const AnalyticsSection = () => {
  return (
    <SectionWrapper>
       <div className="text-center mb-20 relative z-10">
        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
          Deep <span className="text-brand-accent">Analytics</span> & Insights
        </h2>
        <p className="text-white/60 max-w-xl mx-auto">
          We don't just give you marks. We dissect your performance across 40+ parameters to find exactly where you can improve.
        </p>
      </div>

      <div className="relative h-[600px] w-full max-w-5xl mx-auto perspective-1000">

        {/* Main Dashboard - Tilted */}
        <div className="absolute inset-0 flex items-center justify-center transform rotate-x-12 scale-90 opacity-90 transition-transform duration-700 hover:rotate-x-0 hover:scale-100 hover:opacity-100 z-10">
           <AntigravityCard className="w-full h-full border-white/10 bg-brand-dark/95 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-red-500" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500" />
                   <div className="w-3 h-3 rounded-full bg-green-500" />
                 </div>
                 <div className="text-sm text-white/40">Analysis Dashboard v2.0</div>
              </div>

               {/* Grid Content */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Accuracy Ring Simulation */}
                  <div className="col-span-1 bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative">
                     <div className="w-32 h-32 rounded-full border-8 border-white/5 relative flex items-center justify-center">
                        <div className="absolute inset-0 border-8 border-brand-primary border-r-transparent rotate-45 rounded-full" />
                        <span className="text-2xl font-bold">87%</span>
                     </div>
                     <p className="mt-4 text-sm font-medium text-white/60">Overall Accuracy</p>
                  </div>

                  {/* Heatmap Area */}
                   <div className="col-span-2 bg-white/5 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold">Topic Heatmap</h4>
                         <span className="text-xs text-white/40">Last 5 Exams</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2 h-32">
                         {Array.from({ length: 24 }).map((_, i) => (
                           <div
                             key={i}
                             className={`rounded ${
                               (i * 7 + 3) % 10 > 7 ? 'bg-brand-primary' :
                               (i * 7 + 3) % 10 > 5 ? 'bg-brand-primary/50' : 'bg-white/5'
                             }`}
                           />
                         ))}
                      </div>
                   </div>

                   {/* Stats Row */}
                   <div className="col-span-3 grid grid-cols-4 gap-4 mt-4">
                      {[
                        { label: "Rank Predicted", bg: "bg-purple-500/10", text: "text-purple-400", val: "2,405" },
                        { label: "Speed", bg: "bg-blue-500/10", text: "text-blue-400", val: "1.2m/q" },
                        { label: "Stamina", bg: "bg-orange-500/10", text: "text-orange-400", val: "High" },
                        { label: "Potential", bg: "bg-green-500/10", text: "text-green-400", val: "+40 Marks" },
                      ].map((stat, i) => (
                        <div key={i} className={`rounded-xl p-4 ${stat.bg}`}>
                           <p className={`text-xs ${stat.text} font-bold uppercase`}>{stat.label}</p>
                           <p className="text-xl font-bold mt-1">{stat.val}</p>
                        </div>
                      ))}
                   </div>
               </div>
           </AntigravityCard>
        </div>

        {/* Floating Layers */}
        <FloatingElement depth={4} className="-right-10 top-20 z-20">
           <AntigravityCard variant="glass" className="w-64">
              <div className="flex items-center gap-3 mb-2">
                 <Trophy className="w-5 h-5 text-yellow-500" />
                 <span className="text-sm font-bold">Top 1% achieved</span>
              </div>
              <p className="text-xs text-white/50">Your physics score is in the 99th percentile.</p>
           </AntigravityCard>
        </FloatingElement>

        <FloatingElement depth={2} className="-left-10 bottom-40 z-20">
            <AntigravityCard variant="glass" className="w-56">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-brand-secondary" />
                  <div>
                    <span className="text-sm font-bold block">Focus Drift</span>
                    <span className="text-xs text-white/50">-12% in final hour</span>
                  </div>
               </div>
            </AntigravityCard>
        </FloatingElement>

      </div>
    </SectionWrapper>
  );
};
