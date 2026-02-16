"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MousePointerClick, BrainCircuit, BarChart2, TrendingUp } from "lucide-react";

const STEPS = [
  { title: "Select Exam & Level", desc: "Choose your target exam and adaptive difficulty.", icon: MousePointerClick, img: "/how_it_work_1.png" },
  { title: "AI Generation", desc: "Our engine builds a unique test in seconds.", icon: BrainCircuit, img: "/how_it_work_2.png" },
  { title: "Deep Analysis", desc: "Get instant, granular feedback on performance.", icon: BarChart2, img: "/how_it_work_3.png" },
  { title: "Guided Improvement", desc: "Follow AI-recommended paths to boost scores.", icon: TrendingUp, img: "/how_it_work_4.png" },
];

export const HowItWorksIsland = () => {
  return (
    <div className="relative">
      {/* Central Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-brand-primary/50 to-transparent hidden md:block" />

      {STEPS.map((step, i) => (
        <div key={i} className={`flex items-center justify-between gap-8 mb-24 relative ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-100px" }}
            className={`w-full md:w-5/12 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}
          >
            <h3 className="text-2xl font-bold mb-2 text-white">{step.title}</h3>
            <p className="text-white/60">{step.desc}</p>
          </motion.div>

          {/* Center Node */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-brand-dark border border-brand-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <step.icon className="w-5 h-5 text-white" />
          </div>

          {/* Card Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: "-100px" }}
            className="w-full md:w-5/12 hidden md:block"
          >
            <div className="aspect-video bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src={step.img}
                alt={step.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};
