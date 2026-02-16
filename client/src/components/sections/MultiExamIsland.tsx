"use client";

import React from "react";
import { motion } from "framer-motion";
import { AntigravityCard } from "@/components/cards/AntigravityCard";
import { Globe, GraduationCap, Briefcase } from "lucide-react";

const EXAMS = [
  { name: "IIT JEE", category: "Engineering", color: "from-orange-500 to-red-500" },
  { name: "NEET", category: "Medical", color: "from-green-500 to-emerald-500" },
  { name: "GATE", category: "Graduate", color: "from-blue-500 to-indigo-500" },
  { name: "CAT", category: "Management", color: "from-purple-500 to-violet-500" },
  { name: "BITSAT", category: "Engineering", color: "from-pink-500 to-rose-500" },
  { name: "AIIMS", category: "Medical", color: "from-cyan-500 to-teal-500" },
  { name: "State CETs", category: "Regional", color: "from-yellow-500 to-amber-500" },
  { name: "Jobs", category: "Career", color: "from-gray-500 to-slate-500" },
];

export const MultiExamIsland = () => {
  return (
    <div className="relative h-[600px] w-full flex items-center justify-center perspective-1000">
      {/* Central Core */}
      <div className="absolute z-10 w-48 h-48 bg-white/5 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
        <Globe className="w-20 h-20 text-white/20" />
        <div className="absolute font-heading font-bold text-xl tracking-widest text-white/80">UNIVERSE</div>
      </div>

      {/* Orbiting Exam Cards */}
      <div className="absolute inset-0 animate-[spin_60s_linear_infinite]">
        {EXAMS.map((exam, i) => {
          const angle = (i * 360) / EXAMS.length;
          const radius = 300; // Distance from center
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.div
              key={exam.name}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                x: x,
                y: y,
              }}
              className="origin-center"
            >
              <div className="animate-[spin_60s_linear_infinite_reverse] -translate-x-1/2 -translate-y-1/2 w-40">
                <AntigravityCard
                  variant="glass"
                  className="p-4 text-center group hover:scale-110 transition-transform cursor-pointer border-t-[3px] border-t-white/0 hover:border-t-brand-primary"
                >
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-linear-to-br ${exam.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white`}>
                    {exam.name === 'Jobs' ? <Briefcase size={18} /> : <GraduationCap size={18} />}
                  </div>
                  <h3 className="font-bold text-white">{exam.name}</h3>
                  <p className="text-xs text-white/40">{exam.category}</p>
                </AntigravityCard>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Orbit Rings */}
      <div className="absolute inset-0 border border-white/5 rounded-full scale-[0.6] opacity-30" />
      <div className="absolute inset-0 border border-white/5 rounded-full scale-[0.8] opacity-20" />
      <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.2] opacity-10 border-dashed" />
    </div>
  );
};
