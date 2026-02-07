"use client";

import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle, BarChart3, Search, Lightbulb, Target, TrendingUp, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AntigravityCard } from "@/components/ui/AntigravityCard";

export const ProblemSolutionSection = () => {
  return (
    <SectionWrapper>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: The Problem (Chaos) */}
        <div className="relative space-y-6">
           <motion.div
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-white/90">
                Stop guessing. <br />
                <span className="text-red-400">Start measuring.</span>
              </h2>
              <p className="text-white/60 text-lg mb-8">
                Traditional preparation is blind. You solve problems, but do you know where you are actually losing marks?
              </p>
           </motion.div>

           <div className="relative h-[400px]">
              <AntigravityCard className="absolute top-0 left-0 w-64 bg-red-500/5 border-red-500/20 -rotate-6 z-10">
                 <XCircle className="w-8 h-8 text-red-400 mb-2" />
                 <h3 className="font-bold text-red-200">Random Practice</h3>
                 <p className="text-sm text-red-200/60">Solving without direction.</p>
              </AntigravityCard>

              <AntigravityCard className="absolute top-24 left-20 w-64 bg-red-500/5 border-red-500/20 rotate-3 z-20">
                 <Search className="w-8 h-8 text-red-400 mb-2" />
                 <h3 className="font-bold text-red-200">No Analytics</h3>
                 <p className="text-sm text-red-200/60">Where are my weak spots?</p>
              </AntigravityCard>

               <AntigravityCard className="absolute top-48 left-10 w-64 bg-red-500/5 border-red-500/20 -rotate-3 z-30">
                 <Lightbulb className="w-8 h-8 text-red-400 mb-2 opacity-50" />
                 <h3 className="font-bold text-red-200">Zero Clarity</h3>
                 <p className="text-sm text-red-200/60">Am I ready for the exam?</p>
              </AntigravityCard>
           </div>
        </div>

        {/* Right: The Solution (Order & Data) */}
        <div className="relative">
           <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 z-40">
             <div className="h-20 w-px bg-linear-to-b from-transparent to-brand-primary" />
             <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/50 text-brand-primary shadow-[0_0_20px_rgba(99,102,241,0.5)]">
               <ArrowRight className="w-4 h-4" />
             </div>
             <div className="h-20 w-px bg-linear-to-t from-transparent to-brand-primary" />
           </div>

           <AntigravityCard variant="neon" className="w-full relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute inset-0 bg-brand-primary/5 z-0" />

              <div className="relative z-10 p-4">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="p-3 rounded-xl bg-brand-primary/20 text-brand-primary">
                     <BarChart3 className="w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold">Examlytics Intelligence</h3>
                     <p className="text-white/50">Turning guesswork into data points.</p>
                   </div>
                 </div>

                 <div className="space-y-4">
                    {[
                      { icon: Target, text: "Pinpoint Weak Topics", color: "text-brand-accent" },
                      { icon: TrendingUp, text: "Adaptive Difficulty Scaling", color: "text-brand-secondary" },
                      { icon: CheckCircle, text: "Predicted Rank & Score", color: "text-green-400" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                      >
                         <item.icon className={`w-5 h-5 ${item.color}`} />
                         <span className="font-medium text-white/90">{item.text}</span>
                      </motion.div>
                    ))}
                 </div>
              </div>
           </AntigravityCard>
        </div>
      </div>
    </SectionWrapper>
  );
};
