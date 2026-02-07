"use client";

import { Play, Clock, BarChart, FileQuestion } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ExamCardProps {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  questions: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
}

const difficultyColors = {
  EASY: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
  MEDIUM: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
  HARD: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
};

export function ExamCard({ id, title, description, duration, questions, difficulty, category }: ExamCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", difficultyColors[difficulty])}>
          {difficulty}
        </span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{category}</span>
      </div>

      <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">
        {description}
      </p>

      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6 font-medium">
        <div className="flex items-center gap-1.5">
          <Clock size={16} className="text-gray-400" />
          {duration} min
        </div>
        <div className="flex items-center gap-1.5">
          <FileQuestion size={16} className="text-gray-400" />
          {questions} Qs
        </div>
      </div>

      <Link
        href={`/exams/${id}`}
        className="block w-full"
      >
        <button className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-blue-600 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/20">
          Start Exam
          <Play size={16} fill="currentColor" />
        </button>
      </Link>
    </div>
  );
}
