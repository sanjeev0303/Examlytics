"use client";

import { AntigravityCard } from "@/components/cards/AntigravityCard";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { Slider } from "@/components/ui/slider";
import { Loader2, Sparkles } from "lucide-react";
import * as React from "react";
import { EXAM_TYPES } from "./constants";
import { cn } from "@/lib/utils";

interface ExamSummaryCardProps {
  questionCount: number[];
  handleSliderChange: (vals: number[]) => void;
  examType: string;
  difficulty: string;
  language: string;
  jobCategory: string;
  onSubmit: () => void;
  loading: boolean;
  variant?: "glass" | "default";
}

export const ExamSummaryCard = React.memo(({
  questionCount, handleSliderChange, examType, difficulty, language, jobCategory, onSubmit, loading,
  variant = "glass"
}: ExamSummaryCardProps) => {
  const isGlass = variant === "glass";

  return (
    <AntigravityCard variant={isGlass ? "solid" : "solid"} className={cn(isGlass ? "border-white/5 shadow-2xl" : "border-gray-200 bg-white")}>
      <h3 className={cn("text-lg font-heading font-semibold mb-6", isGlass ? "text-white" : "text-gray-900")}>Summary</h3>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className={cn(isGlass ? "text-white/60" : "text-gray-500")}>Question Count</span>
            <span className={cn("font-bold text-lg", isGlass ? "text-brand-accent" : "text-blue-600")}>{questionCount[0]}</span>
          </div>
          <Slider
            value={questionCount}
            onValueChange={handleSliderChange}
            max={50}
            min={5}
            step={5}
            className={cn(isGlass ? "**:[[role=slider]]:bg-brand-primary **:[[role=slider]]:border-white/50" : "")}
          />
          <div className={cn("flex justify-between text-[10px] tracking-widest uppercase", isGlass ? "text-white/30" : "text-gray-400")}>
            <span>Short</span>
            <span>Comprehensive</span>
          </div>
        </div>

        <div className={cn("space-y-3 p-4 rounded-2xl", isGlass ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-100")}>
          <div className="flex justify-between items-center py-1">
            <span className={cn("text-xs", isGlass ? "text-white/40" : "text-gray-500")}>Assessment Type</span>
            <span className={cn("text-sm font-medium", isGlass ? "text-white" : "text-gray-900")}>
              {EXAM_TYPES.find(t => t.id === examType)?.label}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className={cn("text-xs", isGlass ? "text-white/40" : "text-gray-500")}>Difficulty Level</span>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              difficulty === "HARD" ? (isGlass ? "bg-brand-warm/20 text-brand-warm" : "bg-red-50 text-red-600") :
              difficulty === "MEDIUM" ? (isGlass ? "bg-yellow-500/20 text-yellow-500" : "bg-yellow-50 text-yellow-600") :
              (isGlass ? "bg-green-500/20 text-green-500" : "bg-green-50 text-green-600")
            )}>{difficulty}</span>
          </div>
          {language && (
            <div className="flex justify-between items-center py-1">
              <span className={cn("text-xs", isGlass ? "text-white/40" : "text-gray-500")}>Language</span>
              <span className={cn("text-sm font-medium", isGlass ? "text-white" : "text-gray-900")}>{language}</span>
            </div>
          )}
          {jobCategory && (
            <div className="flex justify-between items-center py-1">
              <span className={cn("text-xs", isGlass ? "text-white/40" : "text-gray-500")}>Target Role</span>
              <span className={cn("text-sm font-medium truncate max-w-[120px]", isGlass ? "text-white" : "text-gray-900")}>{jobCategory}</span>
            </div>
          )}
        </div>

        <AntigravityButton
          className="w-full"
          onClick={onSubmit}
          disabled={loading}
          variant={isGlass ? "primary" : "primary"}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Exam
            </>
          )}
        </AntigravityButton>

        <p className={cn("text-[10px] text-center italic", isGlass ? "text-white/20" : "text-gray-400")}>
          AI will craft unique questions based on these parameters.
        </p>
      </div>
    </AntigravityCard>
  );
});

ExamSummaryCard.displayName = "ExamSummaryCard";
