"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Layers, Clock } from "lucide-react";
import { AntigravityCard } from "@/components/cards/AntigravityCard";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { cn } from "@/lib/utils";

const EXAM_TYPES = ["JEE Mains", "NEET", "GATE", "CAT", "BITSAT"];
const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "General Aptitude"];

export const ExamEngineIsland = () => {
  const [selectedExam, setSelectedExam] = useState(EXAM_TYPES[0]);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Controls */}
      <div className="lg:col-span-5 space-y-6">
        <AntigravityCard className="space-y-6">
          <div>
            <label className="text-sm text-white/50 font-medium mb-3 block">Select Exam Target</label>
            <div className="flex flex-wrap gap-2">
              {EXAM_TYPES.map((exam) => (
                <button
                  key={exam}
                  onClick={() => setSelectedExam(exam)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                    selectedExam === exam
                      ? "bg-brand-primary text-white border-brand-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                      : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"
                  )}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-white/50 font-medium mb-3 block">Focus Subject</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                    selectedSubject === subject
                      ? "bg-brand-secondary text-white border-brand-secondary shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                      : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"
                  )}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <AntigravityButton className="w-full group">
              <Zap className="w-4 h-4 mr-2 fill-white group-hover:animate-pulse" />
              Generate Mock Test
            </AntigravityButton>
            <div className="text-center mt-3">
              <span className="text-xs text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full animate-pulse border border-brand-accent/20">
                ⚡ Generated in 2.3s
              </span>
            </div>
          </div>
        </AntigravityCard>
      </div>

      {/* Visualizer */}
      <div className="lg:col-span-7 relative h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-brand-primary/5 rounded-3xl blur-3xl opacity-50" />
        <AntigravityCard variant="glass" className="w-full h-full relative border-brand-primary/20 backdrop-blur-xl">
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>

          <div className="flex flex-col h-full items-center justify-center p-8 text-center space-y-8">
            <motion.div
              key={selectedExam}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-32 h-32"
            >
              <div className="absolute inset-0 border-4 border-brand-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-2 border-4 border-t-brand-accent border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-12 h-12 text-brand-primary drop-shadow-[0_0_10px_rgba(99,102,241,1)]" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-accent to-brand-primary">
                Configuring AI Model...
              </h3>
              <p className="text-white/40">
                Analyzing {selectedExam} patterns • Calibrating {selectedSubject} difficulty
              </p>
            </div>

            <div className="flex items-end gap-1 h-32 w-full max-w-sm mx-auto opacity-50">
              {[40, 60, 35, 80, 55, 90, 45, 70, 50, 65].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className="flex-1 bg-linear-to-t from-brand-primary/0 to-brand-primary rounded-t"
                />
              ))}
            </div>
          </div>
        </AntigravityCard>

        {/* Floating Badges */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -right-6 top-20 bg-brand-dark border border-brand-primary/30 p-3 rounded-xl shadow-xl z-20 flex items-center gap-3"
        >
          <div className="bg-brand-primary/20 p-2 rounded-lg">
            <Layers className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <p className="text-xs text-white/50">Questions</p>
            <p className="font-bold text-sm">Adaptive</p>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute -left-6 bottom-20 bg-brand-dark border border-brand-accent/30 p-3 rounded-xl shadow-xl z-20 flex items-center gap-3"
        >
          <div className="bg-brand-accent/20 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <p className="text-xs text-white/50">Time Limit</p>
            <p className="font-bold text-sm">Real-time</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
