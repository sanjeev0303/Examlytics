"use client";

import React, { useState, useTransition, memo } from "react";
import { useTimer } from "react-timer-hook";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Flag, Clock, ChevronLeft, ChevronRight, CheckCircle2, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface Question {
  id: string;
  text: string;
  options: string[];
  type: "MCQ" | "CODING" | "SUBJECTIVE";
}

interface ExamRunnerProps {
  questions: Question[];
  duration: number; // in seconds
  onSubmit: (answers: { questionId: string; answer: string; timeSpent: number }[]) => void;
  isSubmitting?: boolean;
  title?: string;
}

// Memoized Question Display Component
const QuestionArea = memo(({
  question,
  answer,
  isFlagged,
  onAnswer,
  onToggleFlag,
  onNavigate,
  isFirst,
  isLast,
  isPending
}: {
  question: Question;
  answer: string;
  isFlagged: boolean;
  onAnswer: (val: string) => void;
  onToggleFlag: () => void;
  onNavigate: (dir: 'prev' | 'next' | 'submit') => void;
  isFirst: boolean;
  isLast: boolean;
  isPending: boolean;
}) => {
  return (
    <div className="mx-auto max-w-3xl">
        <Card className="min-h-[500px] border-0 bg-white p-8 shadow-sm ring-1 ring-gray-900/5 dark:bg-zinc-900 dark:ring-white/10 sm:p-10">
            <div className="mb-8 flex items-start justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Question type: {question.type}
                    </span>
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleFlag}
                    className={cn("gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20", isFlagged ? "text-amber-600 hover:text-amber-700" : "text-muted-foreground")}
                    >
                    <Flag className={cn("h-4 w-4", isFlagged && "fill-current")} />
                    {isFlagged ? "Flagged" : "Flag"}
                    </Button>
            </div>

            <div className="mb-10">
                <h2 className="font-heading text-2xl font-bold leading-relaxed text-gray-900 dark:text-white sm:text-3xl">
                    {question.text}
                </h2>
            </div>

            <div className={cn("space-y-4 transition-opacity duration-200", isPending ? "opacity-70" : "opacity-100")}>
                {question.type === "MCQ" ? (
                        <RadioGroup
                        value={answer || ""}
                        onValueChange={onAnswer}
                        className="space-y-3"
                        >
                        {(question.options || []).map((option, idx) => (
                            <div key={idx} className={cn(
                            "group relative flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all hover:bg-gray-50 dark:hover:bg-zinc-800/50",
                            answer === option
                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                : "border-transparent bg-gray-50 hover:border-gray-200 dark:bg-zinc-800/50 dark:hover:border-zinc-700"
                            )}>
                            <RadioGroupItem value={option} id={`opt-${idx}`} className="mt-1" />
                            <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer text-base font-medium leading-relaxed text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                {option}
                            </Label>
                            </div>
                        ))}
                        </RadioGroup>
                ) : (
                        <textarea
                        className="min-h-[300px] w-full resize-none rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-base font-medium leading-relaxed outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900/50"
                        placeholder="Type your answer here..."
                        value={answer || ""}
                        onChange={(e) => onAnswer(e.target.value)}
                        />
                )}
            </div>
        </Card>

        {/* Bottom Navigation */}
        <div className="mt-8 flex items-center justify-between">
            <Button
                variant="ghost"
                onClick={() => onNavigate('prev')}
                disabled={isFirst}
                className="gap-2 pl-2 text-muted-foreground hover:text-foreground"
            >
                <ChevronLeft className="h-5 w-5" />
                Previous
            </Button>

            <Button
                onClick={() => isLast ? onNavigate('submit') : onNavigate('next')}
                className={cn("gap-2 px-8 font-bold", isLast ? "bg-emerald-600 hover:bg-emerald-700" : "")}
            >
                {isLast ? "Submit" : "Next"}
                {!isLast && <ChevronRight className="h-5 w-5" />}
            </Button>
        </div>
    </div>
  );
});
QuestionArea.displayName = "QuestionArea";

// Memoized Sidebar Component
const ExamSidebar = memo(({
    questions,
    answers,
    flags,
    currentIndex,
    onNavigate
}: {
    questions: Question[];
    answers: Record<string, string>;
    flags: Record<string, boolean>;
    currentIndex: number;
    onNavigate: (index: number) => void;
}) => {
    return (
        <aside className="hidden w-80 flex-col border-l border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900 lg:flex">
             <div className="mb-6">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">Question Palette</h3>
             </div>

             <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        const answered = !!answers[q.id];
                        const flagged = !!flags[q.id];
                        const active = idx === currentIndex;
                        return (
                            <button
                                key={q.id}
                                onClick={() => onNavigate(idx)}
                                className={cn(
                                    "relative flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95",
                                    active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-900" :
                                    flagged ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                                    answered ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                                    "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700"
                                )}
                            >
                                {idx + 1}
                                {flagged && <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500 ring-1 ring-white dark:ring-zinc-900" />}
                            </button>
                        );
                    })}
                </div>
             </div>

             <div className="mt-6 space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Answered</span>
                    <span className="font-bold">{Object.keys(answers).length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-amber-700 dark:text-amber-400">Flagged</span>
                    <span className="font-bold">{Object.keys(flags).length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-500">Remaining</span>
                    <span className="font-bold">{questions.length - Object.keys(answers).length}</span>
                </div>
             </div>
        </aside>
    );
});
ExamSidebar.displayName = "ExamSidebar";

export const ExamRunner = ({ questions = [], duration, onSubmit, isSubmitting = false, title = "Exam Session" }: ExamRunnerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [times, setTimes] = useState<Record<string, number>>({});
  const [lastQuestionChange, setLastQuestionChange] = useState(() => Date.now());
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Initialize timer only once
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + duration);

  const {
    seconds,
    minutes,
    hours,
  } = useTimer({ expiryTimestamp, onExpire: () => handleSubmit(true) });

  const currentQuestion = questions[currentQuestionIndex];

  // Prevent crash if questions are empty
  if (!questions || questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading exam content...</p>
        </div>
      </div>
    );
  }

  const handleAnswer = (val: string) => {
    // Wrap state update in transition to keep UI responsive
    startTransition(() => {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
    });
  };

  const toggleFlag = () => {
    setFlags((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }));
  };

  const handleNavigation = (index: number) => {
    // Record time for current question
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const spent = Math.floor((now - lastQuestionChange) / 1000);
    setTimes((prev) => ({
      ...prev,
      [currentQuestion.id]: (prev[currentQuestion.id] || 0) + spent,
    }));
    setLastQuestionChange(now);
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = (force = false) => {
    // Validation
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (!force && isSubmitting) return; // Prevent double submission
    if (!force && unansweredCount > 0) {
        toast.warning(`You have ${unansweredCount} unanswered questions.`, {
            description: "Please answer all questions or check flagged items.",
            action: {
                label: "Submit Anyway",
                onClick: () => handleSubmit(true)
            }
        });
        return;
    }

    // Finalize time for current question
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const spent = Math.floor((now - lastQuestionChange) / 1000);
    const finalTimes = {
      ...times,
      [currentQuestion.id]: (times[currentQuestion.id] || 0) + spent,
    };

    const submission = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] || "",
      timeSpent: finalTimes[q.id] || 0
    }));
    onSubmit(submission);
  };

  const onAreaNavigate = (dir: 'prev' | 'next' | 'submit') => {
      if (dir === 'prev') handleNavigation(currentQuestionIndex - 1);
      if (dir === 'next') handleNavigation(currentQuestionIndex + 1);
      if (dir === 'submit') handleSubmit(false);
  };

  // Progress calculation
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-zinc-950">
      {/* Top Bar: Sticky & Premium */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="hidden md:block">
                    <h1 className="text-sm font-bold text-foreground">{title}</h1>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span>{Math.round(progress)}% Completed</span>
                    </div>
                </div>
                {/* Mobile Menu Trigger */}
                 <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                        <SheetHeader>
                            <SheetTitle>Question Palette</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 grid grid-cols-5 gap-3">
                             {questions.map((q, idx) => {
                                const answered = !!answers[q.id];
                                const flagged = !!flags[q.id];
                                const active = idx === currentQuestionIndex;
                                return (
                                    <button
                                    key={q.id}
                                    onClick={() => {
                                        handleNavigation(idx);
                                        setIsPaletteOpen(false);
                                    }}
                                    className={cn(
                                        "relative flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all",
                                        active ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-950" :
                                        flagged ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                                        answered ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                                        "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700"
                                    )}
                                    >
                                    {idx + 1}
                                    {flagged && <div className="absolute right-0 top-0 h-2 w-2 rounded-full bg-amber-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex items-center gap-4">
                 {/* Timer - Premium & Calm */}
                <div className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-sm font-bold tabular-nums transition-all border",
                    (hours === 0 && minutes < 5)
                        ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 animate-pulse"
                        : "border-gray-200 bg-white/50 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                )}>
                    <Clock className="h-4 w-4 opacity-70" />
                    <span>{hours > 0 ? `${hours}:` : ""}{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
                </div>

                <Button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className={cn("hidden gap-2 font-bold shadow-md transition-all sm:flex", isSubmitting ? "opacity-80" : "hover:scale-[1.02]")}
                >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Finish Exam
                </Button>
            </div>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gray-200 dark:bg-zinc-800">
             <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <QuestionArea
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                isFlagged={!!flags[currentQuestion.id]}
                onAnswer={handleAnswer}
                onToggleFlag={toggleFlag}
                onNavigate={onAreaNavigate}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === questions.length - 1}
                isPending={isPending}
            />
        </main>

        {/* Sidebar (Desktop) - Memoized */}
        <ExamSidebar
            questions={questions}
            answers={answers}
            flags={flags}
            currentIndex={currentQuestionIndex}
            onNavigate={handleNavigation}
        />
      </div>
    </div>
  );
};
