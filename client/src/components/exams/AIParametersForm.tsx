"use client";

import { AntigravityCard } from "@/components/cards/AntigravityCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2 } from "lucide-react";
import * as React from "react";
import { LANGUAGES, JOB_CATEGORIES, JEE_SUBJECTS, NEET_SUBJECTS } from "./constants";
import { cn } from "@/lib/utils";

interface AIParametersFormProps {
  examType: string;
  language: string;
  setLanguage: (val: string) => void;
  jobCategory: string;
  setJobCategory: (val: string) => void;
  subjects: string[];
  handleSubjectToggle: (sub: string) => void;
  topicFocus: string;
  setTopicFocus: (val: string) => void;
  difficulty: string;
  setDifficulty: (val: string) => void;
  mode: string;
  setMode: (val: string) => void;
  variant?: "glass" | "default";
}

export const AIParametersForm = React.memo(({
  examType, language, setLanguage, jobCategory, setJobCategory,
  subjects, handleSubjectToggle, topicFocus, setTopicFocus,
  difficulty, setDifficulty, mode, setMode,
  variant = "glass"
}: AIParametersFormProps) => {
  const isGlass = variant === "glass";

  return (
    <AntigravityCard className={cn(isGlass ? "border-white/5" : "border-gray-200 bg-white shadow-sm")} variant={isGlass ? "glass" : "solid"}>
      <div className="space-y-6">
        <div>
          <h3 className={cn("text-lg font-heading font-semibold flex items-center gap-2", isGlass ? "text-white" : "text-gray-900")}>
            <Wand2 className={cn("w-5 h-5", isGlass ? "text-brand-primary" : "text-blue-600")} />
            AI Parameters
          </h3>
          <p className={cn("text-sm", isGlass ? "text-white/40" : "text-gray-500")}>Define the core focus and difficulty of your assessment.</p>
        </div>

        {examType === "CODING" && (
          <div className="space-y-2">
            <Label className={cn("ml-1", isGlass ? "text-white/80" : "text-gray-700")}>Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className={cn("rounded-xl h-11 focus:ring-brand-primary/50", isGlass ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900")}>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className={cn(isGlass ? "bg-brand-dark/95 border-white/10 text-white backdrop-blur-xl" : "bg-white border-gray-200 text-gray-900")}>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang} className={cn(isGlass ? "focus:bg-brand-primary/20 focus:text-white" : "focus:bg-blue-50")}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {examType === "JOB" && (
          <div className="space-y-2">
            <Label className={cn("ml-1", isGlass ? "text-white/80" : "text-gray-700")}>Target Role</Label>
            <Select value={jobCategory} onValueChange={setJobCategory}>
              <SelectTrigger className={cn("rounded-xl h-11 focus:ring-brand-primary/50", isGlass ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900")}>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className={cn(isGlass ? "bg-brand-dark/95 border-white/10 text-white backdrop-blur-xl" : "bg-white border-gray-200 text-gray-900")}>
                {JOB_CATEGORIES.map(job => (
                  <SelectItem key={job} value={job} className={cn(isGlass ? "focus:bg-brand-primary/20 focus:text-white" : "focus:bg-blue-50")}>{job}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(examType === "JEE" || examType === "NEET") && (
          <div className="space-y-3">
            <Label className={cn("ml-1", isGlass ? "text-white/80" : "text-gray-700")}>Subjects (Select at least one)</Label>
            <div className={cn("grid grid-cols-2 gap-4 rounded-xl p-4", isGlass ? "border border-white/10 bg-white/5" : "border border-gray-100 bg-gray-50")}>
              {(examType === "JEE" ? JEE_SUBJECTS : NEET_SUBJECTS).map(sub => (
                <div key={sub} className="flex items-center space-x-2 group">
                  <Checkbox
                    id={sub}
                    checked={subjects.includes(sub)}
                    onCheckedChange={() => handleSubjectToggle(sub)}
                    className={cn(isGlass ? "border-white/20 data-[state=checked]:bg-brand-primary data-[state=checked]:border-transparent" : "border-gray-300 data-[state=checked]:bg-blue-600")}
                  />
                  <Label htmlFor={sub} className={cn("text-sm cursor-pointer transition-colors font-normal", isGlass ? "text-white/60 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900")}>{sub}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className={cn("ml-1", isGlass ? "text-white/80" : "text-gray-700")}>Specific Topic Focus (Optional)</Label>
          <Input
            placeholder="e.g. Dynamic Programming, Organic Chemistry, SQL Joins..."
            value={topicFocus}
            onChange={(e) => setTopicFocus(e.target.value)}
            className={cn("transition-all rounded-xl h-11", isGlass ? "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-brand-primary/50" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500")}
          />
          <p className={cn("text-xs ml-1 italic", isGlass ? "text-white/30" : "text-gray-400")}>Leave empty for a broad knowledge assessment.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className={cn("ml-1", isGlass ? "text-white/80" : "text-gray-700")}>Difficulty</Label>
            <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <RadioGroupItem value="EASY" id="easy" className={cn(isGlass ? "border-white/20 data-[state=checked]:border-green-500 data-[state=checked]:text-green-500" : "border-gray-300 data-[state=checked]:border-green-600")} />
                <Label htmlFor="easy" className={cn("text-sm cursor-pointer", isGlass ? "text-white/60 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900")}>Easy</Label>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <RadioGroupItem value="MEDIUM" id="medium" className={cn(isGlass ? "border-white/20 data-[state=checked]:border-yellow-500 data-[state=checked]:text-yellow-500" : "border-gray-300 data-[state=checked]:border-yellow-600")} />
                <Label htmlFor="medium" className={cn("text-sm cursor-pointer", isGlass ? "text-white/60 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900")}>Medium</Label>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <RadioGroupItem value="HARD" id="hard" className={cn(isGlass ? "border-white/20 data-[state=checked]:border-brand-warm data-[state=checked]:text-brand-warm" : "border-gray-300 data-[state=checked]:border-red-600")} />
                <Label htmlFor="hard" className={cn("text-sm cursor-pointer", isGlass ? "text-white/60 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900")}>Hard</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className={cn("ml-1", isGlass ? "text-white/80" : "text-gray-700")}>Assessment Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className={cn("rounded-xl h-11 focus:ring-brand-primary/50", isGlass ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={cn(isGlass ? "bg-brand-dark/95 border-white/10 text-white backdrop-blur-xl" : "bg-white border-gray-200 text-gray-900")}>
                <SelectItem value="Objective" className={cn(isGlass ? "focus:bg-brand-primary/20 focus:text-white" : "focus:bg-blue-50")}>Objective (MCQ)</SelectItem>
                <SelectItem value="Subjective" className={cn(isGlass ? "focus:bg-brand-primary/20 focus:text-white" : "focus:bg-blue-50")}>Subjective (Text)</SelectItem>
                <SelectItem value="Mixed" className={cn(isGlass ? "focus:bg-brand-primary/20 focus:text-white" : "focus:bg-blue-50")}>Mixed Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </AntigravityCard>
  );
});

AIParametersForm.displayName = "AIParametersForm";
