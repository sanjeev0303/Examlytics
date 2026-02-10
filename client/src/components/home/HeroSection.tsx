"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Play, TrendingUp, Brain, Target } from "lucide-react";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { AntigravityCard } from "@/components/ui/AntigravityCard";
import { FloatingElement } from "@/components/ui/FloatingElement";

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Particles & Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay for readability */}
        <Image
          src="/landing_background.png"
          alt="Antigravity Background"
          fill
          priority
          className="object-cover opacity-60"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[100px_100px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] z-0 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-[128px] animate-pulse z-0" />
      <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-brand-secondary/10 rounded-full blur-[128px] animate-pulse z-0" />

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-brand-accent text-sm font-medium mb-6 backdrop-blur-md">
              ✨ The Future of Exam Preparation
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight bg-clip-text text-transparent bg-linear-to-r from-white via-white to-white/50">
              Learn Smarter. <br />
              Perform Better. <br />
              Succeed <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-accent">Faster.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto lg:mx-0 font-body"
          >
            AI-powered analytics, weak-topic detection, and adaptive learning paths for JEE, NEET, GATE, and beyond. Your personal AI tutor is here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
          >
            <AntigravityButton size="lg" className="group">
              Start Free Assessment
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </AntigravityButton>
            <AntigravityButton variant="glass" size="lg" className="group">
              <Play className="mr-2 w-5 h-5 fill-white" />
              View Live Demo
            </AntigravityButton>
          </motion.div>
        </div>

        {/* Visuals / Floating Elements */}
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
      </div>
    </div>
  );
};
