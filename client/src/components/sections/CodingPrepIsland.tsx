"use client";

import React from "react";
import { Code2, Play, Terminal } from "lucide-react";
import { AntigravityCard } from "@/components/cards/AntigravityCard";

export const CodingPrepIsland = () => {
  return (
    <div className="lg:w-3/5 mt-12 lg:mt-0 relative group">
      <AntigravityCard variant="solid" className="p-0 overflow-hidden border-white/10 bg-[#0a0a1a] shadow-2xl transition-all duration-500 group-hover:shadow-brand-primary/20">
        <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="px-3 py-1 rounded-md bg-white/5 text-xs font-mono text-white/40 flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              Solution.cpp
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-md text-xs font-bold hover:bg-green-500/20 transition-colors">
            <Play className="w-3 h-3 fill-green-400" />
            Run Tests
          </button>
        </div>

        <div className="p-6 font-mono text-sm space-y-2 text-white/80">
          <p><span className="text-purple-400">#include</span> <span className="text-brand-accent">&lt;iostream&gt;</span></p>
          <p><span className="text-purple-400">using namespace</span> std;</p>
          <p>&nbsp;</p>
          <p><span className="text-purple-400">int</span> <span className="text-blue-400">main</span>() &#123;</p>
          <p className="pl-4 text-white/40">// AI-Optimized Approach for GATE</p>
          <p className="pl-4"><span className="text-purple-400">int</span> n = <span className="text-orange-400">100</span>;</p>
          <p className="pl-4"><span className="text-purple-400">for</span>(<span className="text-purple-400">int</span> i=<span className="text-orange-400">0</span>; i&lt;n; ++i) &#123;</p>
          <p className="pl-8 text-brand-primary">ExamlyticsAI.optimizePath(i);</p>
          <p className="pl-4">&#125;</p>
          <p className="pl-4"><span className="text-purple-400">return</span> <span className="text-orange-400">0</span>;</p>
          <p>&#125;</p>
        </div>

        <div className="bg-black/40 p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-white/40 mb-3">
             <span>Execution Time: 0.12ms</span>
             <span className="text-green-400 font-bold">ALL TESTS PASSED</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-linear-to-r from-brand-primary to-brand-accent w-full animate-in slide-in-from-left duration-1000" />
          </div>
        </div>
      </AntigravityCard>

      <div className="absolute -top-6 -right-6 bg-brand-primary/20 p-4 rounded-2xl backdrop-blur-xl border border-brand-primary/30 z-20">
         <Code2 className="w-8 h-8 text-brand-primary" />
      </div>
    </div>
  );
};
