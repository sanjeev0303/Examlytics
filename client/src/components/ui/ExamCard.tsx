"use client";

import { Play, Clock, FileQuestion, Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExamCardProps {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  questions: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  lastAttemptDate?: string | Date; // Optional
  bestScore?: number; // Optional
}

const difficultyColors = {
  EASY: "text-emerald-700 bg-emerald-50 border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  MEDIUM: "text-amber-700 bg-amber-50 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  HARD: "text-rose-700 bg-rose-50 border-rose-200/50 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
};

export function ExamCard({
    id,
    title,
    description,
    duration,
    questions,
    difficulty,
    category,
    lastAttemptDate,
    bestScore
}: ExamCardProps) {

  const hasAttempted = lastAttemptDate !== undefined || bestScore !== undefined;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 group relative flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider", difficultyColors[difficulty])}>
          {difficulty}
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{category}</span>
      </div>

      <h3 className="text-lg font-bold font-heading text-card-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1" title={title}>
        {title}
      </h3>
      <p className="text-muted-foreground text-sm mb-6 line-clamp-2 grow">
        {description}
      </p>

      {/* Attempt History or Meta */}
      {hasAttempted ? (
         <div className="mb-6 p-3 bg-secondary/30 rounded-xl border border-border/50 flex items-center justify-between text-xs">
            <div className="flex flex-col">
                <span className="text-muted-foreground mb-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Last Attempt
                </span>
                <span className="font-medium text-foreground">
                    {lastAttemptDate ? format(new Date(lastAttemptDate), "MMM d, yyyy") : "N/A"}
                </span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-muted-foreground mb-0.5 flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-amber-500" /> Best
                </span>
                <span className="font-bold text-foreground">{bestScore ?? "--"}%</span>
            </div>
         </div>
      ) : (
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 font-medium">
            <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-muted-foreground/70" />
            {duration} min
            </div>
            <div className="flex items-center gap-1.5">
            <FileQuestion size={16} className="text-muted-foreground/70" />
            {questions} Qs
            </div>
        </div>
      )}

      <Link
        href={`/exams/${id}`}
        className="block w-full mt-auto"
      >
        <button className={cn(
            "w-full py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm",
            hasAttempted
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
        )}>
          {hasAttempted ? "Retake Exam" : "Start Exam"}
          <Play size={14} fill="currentColor" />
        </button>
      </Link>
    </div>
  );
}
