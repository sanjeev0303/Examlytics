"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal, Code, Cpu, MessageSquare } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AntigravityCard } from "@/components/ui/AntigravityCard";
import { AntigravityButton } from "@/components/ui/AntigravityButton";

export const CodingPrepSection = () => {
  return (
    <SectionWrapper>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Content */}
        <div>
           <div className="flex items-center gap-2 mb-4">
             <div className="h-px w-8 bg-brand-secondary" />
             <span className="text-brand-secondary font-bold uppercase tracking-widest text-sm">Career Readiness</span>
           </div>

             <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
             Beyond Exams. <br />
             <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
               Build Your Career.
             </span>
           </h2>

           <p className="text-white/60 text-lg mb-8">
             Master Data Structures, Algorithms, and System Design with our integrated coding environment. Prepare for job interviews with AI-driven mock sessions.
           </p>

           <div className="grid sm:grid-cols-2 gap-4">
             <AntigravityCard variant="glass" className="p-4 hover:border-brand-accent/30 transition-colors cursor-pointer group">
                <Code className="w-8 h-8 text-brand-accent mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-white mb-1">Interactive IDE</h3>
                <p className="text-sm text-white/50">Run code in 40+ languages with instant feedback.</p>
             </AntigravityCard>

             <AntigravityCard variant="glass" className="p-4 hover:border-brand-primary/30 transition-colors cursor-pointer group">
                <MessageSquare className="w-8 h-8 text-brand-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-white mb-1">AI Mock Interviews</h3>
                <p className="text-sm text-white/50">Real-time voice/chat interviews with detailed critiques.</p>
             </AntigravityCard>
           </div>

           <div className="mt-8">
             <AntigravityButton>
               Start Coding Practice
             </AntigravityButton>
           </div>
        </div>

        {/* Right: Visual (Terminal + Interview) */}
        <div className="relative perspective-1000">
           {/* Terminal Window */}
           <motion.div
             initial={{ rotateY: 10, z: -50 }}
             whileInView={{ rotateY: 0, z: 0 }}
             transition={{ duration: 0.8 }}
             className="relative z-10"
           >
             <AntigravityCard variant="solid" className="w-full bg-[#0d0d1e] font-mono text-sm overflow-hidden p-0 border-white/10 shadow-2xl">
                <div className="bg-white/5 px-4 py-2 flex gap-2 border-b border-white/5 items-center">
                   <div className="w-3 h-3 rounded-full bg-red-500/80" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                   <div className="w-3 h-3 rounded-full bg-green-500/80" />
                   <div className="ml-2 text-xs text-white/40">examlytics-ide — bash</div>
                </div>
                <div className="p-6 space-y-2">
                   <div className="flex gap-2">
                      <span className="text-green-400">➜</span>
                      <span className="text-blue-400">~/problems</span>
                      <span className="text-white">g++ solution.cpp && ./a.out</span>
                   </div>
                   <div className="text-white/60 pl-4">
                      Compiling... <br />
                      <span className="text-green-400">Test Case 1: Passed (0.02s)</span> <br />
                      <span className="text-green-400">Test Case 2: Passed (0.05s)</span> <br />
                      <span className="text-green-400">Test Case 3: Passed (0.12s)</span> <br />
                   </div>
                   <div className="flex gap-2 animate-pulse">
                      <span className="text-green-400">➜</span>
                      <span className="text-blue-400">~/problems</span>
                      <span className="w-2 h-5 bg-white/50 block" />
                   </div>
                </div>
             </AntigravityCard>
           </motion.div>

           {/* Floating Interview Card */}
           <div className="absolute -right-10 -bottom-10 z-20 w-64">
              <AntigravityCard variant="glass" className="backdrop-blur-xl">
                 <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                       <Cpu className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">AI Interviewer</p>
                      <p className="text-xs text-white/50">Speaking...</p>
                    </div>
                    <div className="ml-auto flex gap-1 items-end h-4">
                       {[1, 3, 2, 4, 3].map((h, i) => (
                         <motion.div
                           key={i}
                           animate={{ height: [4, 16, 4] }}
                           transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                           className="w-1 bg-brand-primary rounded-full"
                         />
                       ))}
                    </div>
                 </div>
                 <p className="text-sm text-white/80 italic">
                   "Can you optimize the time complexity of your solution to O(n)?"
                 </p>
              </AntigravityCard>
           </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
